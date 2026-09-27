<?php
/* Banco de dados: MySQL/MariaDB na hospedagem, SQLite para testar sem
   servidor. O SQL daqui é o denominador comum dos dois — ids em texto (sem
   AUTO_INCREMENT), datas em ISO 8601 — para o mesmo código rodar igual. */
declare(strict_types=1);

final class Banco
{
  private static ?PDO $pdo = null;

  public static function tipo(): string
  {
    $b = (array) astro_config('banco', []);
    return ($b['tipo'] ?? 'mysql') === 'sqlite' ? 'sqlite' : 'mysql';
  }

  public static function pdo(): PDO
  {
    if (self::$pdo) return self::$pdo;
    $b = (array) astro_config('banco', []);
    $opcoes = [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ];
    if (self::tipo() === 'sqlite') {
      if (!is_dir(ASTRO_DADOS)) mkdir(ASTRO_DADOS, 0700, true);
      $arquivo = $b['arquivo'] ?? (ASTRO_DADOS . '/astro.sqlite');
      self::$pdo = new PDO('sqlite:' . $arquivo, null, null, $opcoes);
      self::$pdo->exec('PRAGMA journal_mode = WAL');
      self::$pdo->exec('PRAGMA busy_timeout = 4000');
    } else {
      $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $b['host'] ?? 'localhost', (int) ($b['porta'] ?? 3306), $b['nome'] ?? '');
      self::$pdo = new PDO($dsn, (string) ($b['usuario'] ?? ''), (string) ($b['senha'] ?? ''), $opcoes);
      self::$pdo->exec("SET time_zone = '-03:00'");
    }
    return self::$pdo;
  }

  public static function um(string $sql, array $p = []): ?array
  {
    $st = self::pdo()->prepare($sql);
    $st->execute($p);
    $r = $st->fetch();
    return $r === false ? null : $r;
  }

  public static function todos(string $sql, array $p = []): array
  {
    $st = self::pdo()->prepare($sql);
    $st->execute($p);
    return $st->fetchAll();
  }

  public static function exec(string $sql, array $p = []): int
  {
    $st = self::pdo()->prepare($sql);
    $st->execute($p);
    return $st->rowCount();
  }

  /* insere a partir de um array coluna => valor */
  public static function inserir(string $tabela, array $dados): void
  {
    $cols = array_keys($dados);
    $sql = 'INSERT INTO ' . $tabela . ' (' . implode(',', $cols) . ') VALUES (' .
      implode(',', array_fill(0, count($cols), '?')) . ')';
    self::exec($sql, array_values($dados));
  }

  public static function atualizar(string $tabela, string $id, array $dados): int
  {
    $sets = implode(',', array_map(fn($c) => $c . ' = ?', array_keys($dados)));
    return self::exec('UPDATE ' . $tabela . ' SET ' . $sets . ' WHERE id = ?', [...array_values($dados), $id]);
  }

  public static function duplicado(PDOException $e): bool
  {
    /* 23000 = violação de unicidade, nos dois bancos */
    return $e->getCode() === '23000' || str_contains($e->getMessage(), 'UNIQUE');
  }

  /* ------------------------------------------------------------------ */
  /* Esquema. Rodar de novo não estraga nada (IF NOT EXISTS).            */
  /* ------------------------------------------------------------------ */
  private const TABELAS = [
    'usuarios' => [
      'cols' => "id VARCHAR(24) NOT NULL PRIMARY KEY,
        nome VARCHAR(80) NOT NULL,
        email VARCHAR(160) NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        papel VARCHAR(20) NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1,
        trocar_senha INTEGER NOT NULL DEFAULT 0,
        totp_cripto TEXT NULL,
        totp_ultimo INTEGER NULL,
        falhas INTEGER NOT NULL DEFAULT 0,
        bloqueado_ate VARCHAR(25) NULL,
        criado VARCHAR(25) NOT NULL,
        atualizado VARCHAR(25) NOT NULL,
        ultimo_acesso VARCHAR(25) NULL",
      'unicos' => ['email' => 'email'],
      'indices' => [],
    ],
    'leads' => [
      'cols' => "id VARCHAR(24) NOT NULL PRIMARY KEY,
        criado VARCHAR(25) NOT NULL,
        atualizado VARCHAR(25) NOT NULL,
        etapa VARCHAR(20) NOT NULL,
        modalidade VARCHAR(20) NOT NULL DEFAULT '',
        valor VARCHAR(40) NOT NULL DEFAULT '',
        prazo VARCHAR(30) NOT NULL DEFAULT '',
        lance VARCHAR(30) NOT NULL DEFAULT '',
        canal VARCHAR(20) NOT NULL DEFAULT '',
        pagina VARCHAR(120) NOT NULL DEFAULT '',
        origem TEXT NULL,
        dados_cripto TEXT NULL,
        fone_indice VARCHAR(64) NULL,
        responsavel VARCHAR(24) NULL,
        nota_cripto TEXT NULL,
        valor_fechado VARCHAR(40) NULL,
        historico TEXT NULL,
        excluido VARCHAR(25) NULL",
      'unicos' => [],
      'indices' => ['leads_criado' => 'criado', 'leads_fone' => 'fone_indice', 'leads_etapa' => 'etapa'],
    ],
    'reservas' => [
      'cols' => "id VARCHAR(24) NOT NULL PRIMARY KEY,
        dia VARCHAR(10) NOT NULL,
        hora VARCHAR(5) NOT NULL,
        vaga VARCHAR(16) NULL,
        dados_cripto TEXT NULL,
        sala VARCHAR(200) NOT NULL DEFAULT '',
        lead_id VARCHAR(24) NULL,
        criada VARCHAR(25) NOT NULL,
        cancelada INTEGER NOT NULL DEFAULT 0",
      /* "vaga" = dia+hora enquanto a reunião vale, NULL quando cancelada:
         o próprio banco impede duas reuniões no mesmo horário, sem corrida */
      'unicos' => ['reservas_vaga' => 'vaga'],
      'indices' => ['reservas_dia' => 'dia'],
    ],
    'opcoes' => [
      'cols' => "chave VARCHAR(60) NOT NULL PRIMARY KEY,
        valor TEXT NULL",
      'unicos' => [],
      'indices' => [],
    ],
    'auditoria' => [
      'cols' => "id VARCHAR(24) NOT NULL PRIMARY KEY,
        quando VARCHAR(25) NOT NULL,
        usuario_id VARCHAR(24) NULL,
        acao VARCHAR(40) NOT NULL,
        alvo VARCHAR(60) NOT NULL DEFAULT '',
        ip VARCHAR(45) NOT NULL DEFAULT '',
        detalhe TEXT NULL",
      'unicos' => [],
      'indices' => ['auditoria_quando' => 'quando'],
    ],
    'limites' => [
      'cols' => "chave VARCHAR(100) NOT NULL PRIMARY KEY,
        inicio INTEGER NOT NULL,
        contagem INTEGER NOT NULL",
      'unicos' => [],
      'indices' => [],
    ],
  ];

  public static function criarTabelas(): void
  {
    $pdo = self::pdo();
    foreach (self::TABELAS as $nome => $t) {
      if (self::tipo() === 'mysql') {
        $extra = '';
        foreach ($t['unicos'] as $idx => $col) $extra .= ",\n UNIQUE KEY {$idx}_u ({$col})";
        foreach ($t['indices'] as $idx => $col) $extra .= ",\n KEY {$idx} ({$col})";
        $pdo->exec("CREATE TABLE IF NOT EXISTS {$nome} (\n{$t['cols']}{$extra}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
      } else {
        $pdo->exec("CREATE TABLE IF NOT EXISTS {$nome} (\n{$t['cols']}\n)");
        foreach ($t['unicos'] as $idx => $col) $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS {$idx}_u ON {$nome} ({$col})");
        foreach ($t['indices'] as $idx => $col) $pdo->exec("CREATE INDEX IF NOT EXISTS {$idx} ON {$nome} ({$col})");
      }
    }
  }

  /* chave/valor simples: configuração da agenda, data da última limpeza… */
  public static function opcao(string $chave, $padrao = null)
  {
    $r = self::um('SELECT valor FROM opcoes WHERE chave = ?', [$chave]);
    if (!$r) return $padrao;
    $v = json_decode((string) $r['valor'], true);
    return $v === null ? $padrao : $v;
  }

  public static function definirOpcao(string $chave, $valor): void
  {
    $json = json_encode($valor, JSON_UNESCAPED_UNICODE);
    if (self::exec('UPDATE opcoes SET valor = ? WHERE chave = ?', [$json, $chave]) === 0) {
      try { self::inserir('opcoes', ['chave' => $chave, 'valor' => $json]); }
      catch (PDOException $e) {
        /* MySQL devolve 0 linhas no UPDATE quando o valor não mudou: a
           linha existe, e o INSERT bate na chave. Está tudo certo. */
        if (!self::duplicado($e)) throw $e;
      }
    }
  }
}
