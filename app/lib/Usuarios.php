<?php
/* ============================================================================
   USUÁRIOS DO PAINEL (a equipe da Astro — não os clientes)
   Papéis:  admin      → tudo, inclusive equipe, auditoria e exportação
            consultor  → contatos atribuídos a ele ou ainda sem dono, e agenda
   ========================================================================= */
declare(strict_types=1);

final class Usuarios
{
  public const PAPEIS = ['admin', 'consultor'];
  private const MAX_FALHAS = 5;
  private const BLOQUEIO_MIN = 15;

  /* senhas que qualquer robô tenta primeiro */
  private const PROIBIDAS = ['123456789012', 'astroconsorcios', 'astroconsorcio', 'consorcioastro',
    'senhasenhasenha', 'qwertyuiopas', 'abcdefghijkl', 'cascavelparana', 'administrador', 'passwordpassword'];

  public static function validarSenha(string $senha, string $email = ''): ?string
  {
    if (mb_strlen($senha) < 12) return 'A senha precisa ter pelo menos 12 caracteres. Uma frase funciona bem.';
    if (mb_strlen($senha) > 128) return 'Senha longa demais.';
    $baixa = mb_strtolower($senha);
    foreach (self::PROIBIDAS as $p) if (str_contains($baixa, $p)) return 'Essa senha é fácil de adivinhar. Escolha outra.';
    $local = mb_strtolower(explode('@', $email)[0] ?? '');
    if ($local !== '' && mb_strlen($local) >= 4 && str_contains($baixa, $local)) return 'A senha não pode conter o seu e-mail.';
    if (count(array_unique(mb_str_split($senha))) < 5) return 'Senha repetitiva demais.';
    return null;
  }

  public static function publico(array $u): array
  {
    return ['id' => $u['id'], 'nome' => $u['nome'], 'email' => $u['email'], 'papel' => $u['papel'],
            'ativo' => (int) $u['ativo'] === 1, 'tem2fa' => !empty($u['totp_cripto']),
            'ultimo_acesso' => $u['ultimo_acesso'] ?? null, 'criado' => $u['criado'] ?? null];
  }

  public static function listar(): array
  {
    return array_map([self::class, 'publico'], Banco::todos('SELECT * FROM usuarios ORDER BY nome'));
  }

  public static function criar(string $nome, string $email, string $papel, string $senha, bool $trocarSenha = true): array
  {
    $nome = Http::texto($nome, 80);
    $email = mb_strtolower(Http::texto($email, 160));
    if (mb_strlen($nome) < 2) throw new InvalidArgumentException('Escreva o nome.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('E-mail inválido.');
    if (!in_array($papel, self::PAPEIS, true)) throw new InvalidArgumentException('Papel inválido.');
    if ($erro = self::validarSenha($senha, $email)) throw new InvalidArgumentException($erro);
    if (Banco::um('SELECT id FROM usuarios WHERE email = ?', [$email])) throw new InvalidArgumentException('Já existe alguém com esse e-mail.');
    $agora = agora_iso();
    $u = ['id' => Cripto::id(), 'nome' => $nome, 'email' => $email, 'senha_hash' => Cripto::senhaHash($senha),
          'papel' => $papel, 'ativo' => 1, 'trocar_senha' => $trocarSenha ? 1 : 0,
          'falhas' => 0, 'criado' => $agora, 'atualizado' => $agora];
    Banco::inserir('usuarios', $u);
    return $u;
  }

  /* hash de mentira para o tempo de resposta ser igual com e sem e-mail
     cadastrado: sem isso, dá para descobrir quem tem conta cronometrando */
  private static function hashFalso(): string
  {
    static $h = null;
    return $h ??= Cripto::senhaHash('senha-que-nao-existe-' . bin2hex(random_bytes(4)));
  }

  /* Devolve ['ok'=>true,'usuario'] | ['precisa2fa'=>true] | ['erro'=>msg] */
  public static function tentarEntrar(string $email, string $senha): array
  {
    $email = mb_strtolower(Http::texto($email, 160));
    $generico = ['erro' => 'E-mail ou senha incorretos.'];

    if (!Limite::permitir('login-ip', 20, 900)) {
      return ['erro' => 'Muitas tentativas deste endereço. Espere 15 minutos.'];
    }
    $u = Banco::um('SELECT * FROM usuarios WHERE email = ?', [$email]);
    if (!$u) { Cripto::senhaConfere($senha, self::hashFalso()); Auditoria::registrar('login_falhou', '', ['motivo' => 'email']); return $generico; }

    if (!empty($u['bloqueado_ate']) && $u['bloqueado_ate'] > agora_iso()) {
      Auditoria::registrar('login_bloqueado', $u['id'], [], $u['id']);
      return ['erro' => 'Conta travada por tentativas erradas. Tente de novo em alguns minutos.'];
    }
    if (!Cripto::senhaConfere($senha, $u['senha_hash']) || !(int) $u['ativo']) {
      $falhas = (int) $u['falhas'] + 1;
      $bloqueio = null;
      if ($falhas >= self::MAX_FALHAS) {
        /* cada rodada de erros dobra o castigo: 15, 30, 60 min… até 24 h */
        $min = min(1440, self::BLOQUEIO_MIN * (2 ** intdiv($falhas - self::MAX_FALHAS, self::MAX_FALHAS)));
        $bloqueio = (new DateTimeImmutable("+{$min} minutes"))->format(DATE_ATOM);
      }
      Banco::exec('UPDATE usuarios SET falhas = ?, bloqueado_ate = ? WHERE id = ?', [$falhas, $bloqueio, $u['id']]);
      Auditoria::registrar('login_falhou', $u['id'], ['falhas' => $falhas], $u['id']);
      return $generico;
    }

    if (Cripto::senhaPrecisaRefazer($u['senha_hash'])) {
      Banco::exec('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [Cripto::senhaHash($senha), $u['id']]);
    }
    if (!empty($u['totp_cripto'])) return ['precisa2fa' => true, 'usuario' => $u];
    return ['ok' => true, 'usuario' => $u];
  }

  public static function confirmar2fa(string $uid, string $codigo): ?array
  {
    if (!Limite::permitir('2fa', 8, 900, $uid)) return null;
    $u = Banco::um('SELECT * FROM usuarios WHERE id = ? AND ativo = 1', [$uid]);
    if (!$u || empty($u['totp_cripto'])) return null;
    $segredo = Cripto::decifrar($u['totp_cripto']);
    $passo = $segredo ? Totp::verificar($segredo, $codigo, $u['totp_ultimo'] !== null ? (int) $u['totp_ultimo'] : null) : null;
    if ($passo === null) { Auditoria::registrar('2fa_falhou', $uid, [], $uid); return null; }
    Banco::exec('UPDATE usuarios SET totp_ultimo = ? WHERE id = ?', [$passo, $uid]);
    return $u;
  }

  public static function registrarEntrada(array $u): void
  {
    Banco::exec('UPDATE usuarios SET falhas = 0, bloqueado_ate = NULL, ultimo_acesso = ? WHERE id = ?', [agora_iso(), $u['id']]);
    Auditoria::registrar('login', $u['id'], [], $u['id']);
  }

  public static function trocarSenha(string $uid, string $atual, string $nova): void
  {
    $u = Banco::um('SELECT * FROM usuarios WHERE id = ?', [$uid]);
    if (!$u || !Cripto::senhaConfere($atual, $u['senha_hash'])) throw new InvalidArgumentException('A senha atual não confere.');
    if ($erro = self::validarSenha($nova, $u['email'])) throw new InvalidArgumentException($erro);
    if (Cripto::senhaConfere($nova, $u['senha_hash'])) throw new InvalidArgumentException('A nova senha precisa ser diferente da atual.');
    Banco::atualizar('usuarios', $uid, ['senha_hash' => Cripto::senhaHash($nova), 'trocar_senha' => 0, 'atualizado' => agora_iso()]);
    Auditoria::registrar('senha_trocada', $uid);
  }

  public static function redefinirSenha(string $uid, string $nova): void
  {
    $u = Banco::um('SELECT email FROM usuarios WHERE id = ?', [$uid]);
    if (!$u) throw new InvalidArgumentException('Usuário não encontrado.');
    if ($erro = self::validarSenha($nova, $u['email'])) throw new InvalidArgumentException($erro);
    Banco::atualizar('usuarios', $uid, ['senha_hash' => Cripto::senhaHash($nova), 'trocar_senha' => 1,
      'falhas' => 0, 'bloqueado_ate' => null, 'atualizado' => agora_iso()]);
    Auditoria::registrar('senha_redefinida', $uid);
  }

  public static function atualizar(string $uid, array $m, string $quemFaz): void
  {
    $u = Banco::um('SELECT * FROM usuarios WHERE id = ?', [$uid]);
    if (!$u) throw new InvalidArgumentException('Usuário não encontrado.');
    $mud = [];
    if (isset($m['papel'])) {
      if (!in_array($m['papel'], self::PAPEIS, true)) throw new InvalidArgumentException('Papel inválido.');
      $mud['papel'] = $m['papel'];
    }
    if (isset($m['ativo'])) $mud['ativo'] = $m['ativo'] ? 1 : 0;
    if (isset($m['nome'])) $mud['nome'] = Http::texto($m['nome'], 80);
    if ($uid === $quemFaz && ((isset($mud['papel']) && $mud['papel'] !== 'admin') || (isset($mud['ativo']) && !$mud['ativo']))) {
      throw new InvalidArgumentException('Você não pode tirar o seu próprio acesso de administrador.');
    }
    /* nunca deixar o painel sem nenhum administrador ativo */
    $viraNaoAdmin = (isset($mud['papel']) && $mud['papel'] !== 'admin') || (isset($mud['ativo']) && !$mud['ativo']);
    if ($u['papel'] === 'admin' && $viraNaoAdmin) {
      $outros = Banco::um("SELECT COUNT(*) AS n FROM usuarios WHERE papel = 'admin' AND ativo = 1 AND id <> ?", [$uid]);
      if ((int) ($outros['n'] ?? 0) === 0) throw new InvalidArgumentException('Precisa sobrar pelo menos um administrador ativo.');
    }
    if (!$mud) return;
    $mud['atualizado'] = agora_iso();
    Banco::atualizar('usuarios', $uid, $mud);
    Auditoria::registrar('usuario_alterado', $uid, array_keys($mud));
  }

  public static function iniciar2fa(string $uid): array
  {
    $u = Banco::um('SELECT email FROM usuarios WHERE id = ?', [$uid]);
    $segredo = Totp::novoSegredo();
    $_SESSION['2fa_novo'] = ['segredo' => $segredo, 'ate' => time() + 600];
    return ['segredo' => trim(chunk_split($segredo, 4, ' ')), 'uri' => Totp::uri($segredo, (string) ($u['email'] ?? ''))];
  }

  public static function ativar2fa(string $uid, string $codigo): bool
  {
    $n = $_SESSION['2fa_novo'] ?? null;
    if (!$n || $n['ate'] < time()) return false;
    $passo = Totp::verificar($n['segredo'], $codigo);
    if ($passo === null) return false;
    Banco::atualizar('usuarios', $uid, ['totp_cripto' => Cripto::cifrar($n['segredo']), 'totp_ultimo' => $passo, 'atualizado' => agora_iso()]);
    unset($_SESSION['2fa_novo']);
    Auditoria::registrar('2fa_ativado', $uid);
    return true;
  }

  public static function desativar2fa(string $uid, string $senha): void
  {
    $u = Banco::um('SELECT senha_hash FROM usuarios WHERE id = ?', [$uid]);
    if (!$u || !Cripto::senhaConfere($senha, $u['senha_hash'])) throw new InvalidArgumentException('Senha incorreta.');
    Banco::atualizar('usuarios', $uid, ['totp_cripto' => null, 'totp_ultimo' => null, 'atualizado' => agora_iso()]);
    Auditoria::registrar('2fa_desativado', $uid);
  }
}
