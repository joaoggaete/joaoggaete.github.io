<?php
/* ============================================================================
   INSTALAÇÃO — roda uma vez só
   Confere o servidor, cria as tabelas, gera as chaves de criptografia e o
   primeiro administrador. Depois disso trava sozinha (app/dados/instalado.lock)
   e passa a responder só "já instalado".
   Protegida pelo 'codigo_instalacao' do config: só quem editou o config no
   servidor sabe o código — um visitante que chegue aqui antes de você não
   consegue criar um administrador.
   ========================================================================= */
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
Http::cabecalhosSeguranca();

function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

$checagens = [];
$tudoOk = true;
$marca = function (string $nome, bool $ok, string $dica = '') use (&$checagens, &$tudoOk) {
  $checagens[] = [$nome, $ok, $dica];
  if (!$ok) $tudoOk = false;
};

$instalado = astro_instalado();
$mensagem = '';
$sucesso = false;

if (!$instalado) {
  $marca('PHP 8.1 ou mais novo (' . PHP_VERSION . ')', PHP_VERSION_ID >= 80100, 'hPanel → Avançado → Configuração do PHP');
  $marca('Extensão PDO', extension_loaded('pdo'), 'Ative "pdo" na configuração do PHP');
  $marca('Criptografia (sodium)', function_exists('sodium_crypto_secretbox'), 'Ative "sodium" na configuração do PHP');
  $marca('mbstring', function_exists('mb_substr'), 'Ative "mbstring" na configuração do PHP');
  $marca('cURL (Apollo e avisos)', function_exists('curl_init'), 'Opcional, mas ative "curl" para o Apollo funcionar');
  if (!is_dir(ASTRO_DADOS)) @mkdir(ASTRO_DADOS, 0700, true);
  $marca('Pasta app/dados gravável', is_dir(ASTRO_DADOS) && is_writable(ASTRO_DADOS), 'Gerenciador de arquivos → app/dados → permissões 700 ou 755');
  $marca('Site em HTTPS', Http::https() || getenv('ASTRO_PERMITIR_HTTP') === '1', 'hPanel → Segurança → SSL. Sem HTTPS, senha e dados viajam abertos.');
  $marca('Arquivo de configuração encontrado', astro_configurado(), 'Copie app/config.exemplo.php para app/config.php e preencha');

  $codigoCfg = (string) astro_config('codigo_instalacao', '');
  if (astro_configurado()) {
    $marca('Código de instalação definido no config', mb_strlen($codigoCfg) >= 12 && !str_starts_with($codigoCfg, 'TROQUE'),
      'Troque "codigo_instalacao" no config por uma frase só sua (12+ caracteres)');
    $b = (array) astro_config('banco', []);
    if (($b['tipo'] ?? 'mysql') === 'mysql') {
      $host = strtolower((string) ($b['host'] ?? ''));
      $marca('Banco no próprio servidor (localhost)', in_array($host, ['localhost', '127.0.0.1', '::1'], true) || getenv('ASTRO_BANCO_REMOTO') === '1',
        'Na Hostinger o host do MySQL é "localhost"');
    }
    try { Banco::pdo(); $marca('Conexão com o banco de dados', true); }
    catch (Throwable $ex) {
      error_log('instalar banco: ' . $ex->getMessage());
      $marca('Conexão com o banco de dados', false, 'Confira nome do banco, usuário e senha no config (hPanel → Bancos de dados)');
    }
  }
  /* o cURL é opcional: não bloqueia a instalação */
  $tudoOk = array_reduce($checagens, fn($c, $x) => $c && ($x[1] || str_starts_with($x[0], 'cURL')), true);

  /* ------------ envio do formulário ------------ */
  if ($tudoOk && Http::metodo() === 'POST') {
    Sessao::iniciar();
    $tentativas = ASTRO_DADOS . '/instalar-tentativas.json';
    $t = is_file($tentativas) ? (json_decode((string) file_get_contents($tentativas), true) ?: []) : [];
    $t = array_values(array_filter($t, fn($x) => $x > time() - 3600));
    if (!hash_equals(Sessao::csrf(), (string) ($_POST['csrf'] ?? ''))) {
      $mensagem = 'A página expirou. Recarregue e tente de novo.';
    } elseif (count($t) >= 10) {
      $mensagem = 'Muitas tentativas. Espere uma hora.';
    } elseif (!hash_equals($codigoCfg, (string) ($_POST['codigo'] ?? ''))) {
      $t[] = time();
      file_put_contents($tentativas, json_encode($t));
      $mensagem = 'Código de instalação incorreto.';
    } elseif (($_POST['senha'] ?? '') !== ($_POST['senha2'] ?? '')) {
      $mensagem = 'As duas senhas não são iguais.';
    } else {
      try {
        Cripto::gerarChavesSeFaltar();
        Banco::criarTabelas();
        $ja = Banco::um('SELECT COUNT(*) AS n FROM usuarios');
        if ((int) ($ja['n'] ?? 0) === 0) {
          $u = Usuarios::criar((string) ($_POST['nome'] ?? ''), (string) ($_POST['email'] ?? ''), 'admin', (string) ($_POST['senha'] ?? ''), false);
          Auditoria::registrar('instalacao', $u['id'], ['php' => PHP_VERSION, 'banco' => Banco::tipo()], $u['id']);
        }
        file_put_contents(ASTRO_DADOS . '/instalado.lock', agora_iso() . "\n");
        @unlink($tentativas);
        $sucesso = true;
      } catch (InvalidArgumentException $ex) {
        $mensagem = $ex->getMessage();
      } catch (Throwable $ex) {
        error_log('instalar: ' . $ex->getMessage());
        $mensagem = 'Não consegui concluir. Veja o arquivo app/dados/logs/php-erros.log.';
      }
    }
  }
}
if (session_status() !== PHP_SESSION_ACTIVE && !$instalado && $tudoOk) Sessao::iniciar();
?><!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Instalação — Astro Consórcios</title>
<link rel="stylesheet" href="/painel/painel.css">
</head>
<body class="instalar">
<main class="caixa-central">
  <p class="eyebrow">Astro Consórcios · servidor</p>
  <?php if ($instalado || $sucesso): ?>
    <h1><?= $sucesso ? 'Tudo pronto' : 'Já instalado' ?></h1>
    <?php if ($sucesso): ?>
      <p>O banco foi criado, as chaves de criptografia foram geradas e o seu usuário de administrador existe.</p>
      <div class="alerta">
        <strong>Faça agora uma cópia de <code>app/dados/chaves.php</code></strong> (Gerenciador de arquivos → baixar)
        e guarde fora do servidor — num pendrive ou cofre de senhas. Sem esse arquivo, nome e telefone dos contatos
        ficam ilegíveis para sempre, até para você.
      </div>
    <?php else: ?>
      <p>Esta instalação já foi feita e está travada. Para refazer do zero, apague <code>app/dados/instalado.lock</code> — os dados continuam no banco.</p>
    <?php endif; ?>
    <p><a class="btn" href="/painel/">Abrir o painel</a></p>
  <?php else: ?>
    <h1>Instalar o painel</h1>
    <p>Conferindo se o servidor tem tudo o que o site precisa:</p>
    <ul class="checagens">
      <?php foreach ($checagens as [$nome, $ok, $dica]): ?>
        <li class="<?= $ok ? 'bom' : 'ruim' ?>"><span><?= $ok ? '✓' : '✗' ?></span> <?= e($nome) ?>
          <?php if (!$ok && $dica): ?><small><?= e($dica) ?></small><?php endif; ?></li>
      <?php endforeach; ?>
    </ul>
    <?php if ($tudoOk): ?>
      <form method="post" class="formulario" autocomplete="off">
        <input type="hidden" name="csrf" value="<?= e(Sessao::csrf()) ?>">
        <label>Código de instalação (o que você escreveu no config)
          <input type="password" name="codigo" required autocomplete="off"></label>
        <h2>Seu usuário de administrador</h2>
        <label>Nome<input name="nome" required maxlength="80" value="<?= e((string) ($_POST['nome'] ?? '')) ?>"></label>
        <label>E-mail<input type="email" name="email" required maxlength="160" value="<?= e((string) ($_POST['email'] ?? '')) ?>" autocomplete="username"></label>
        <label>Senha <small>(12+ caracteres — uma frase é o melhor)</small><input type="password" name="senha" required minlength="12" autocomplete="new-password"></label>
        <label>Repita a senha<input type="password" name="senha2" required minlength="12" autocomplete="new-password"></label>
        <?php if ($mensagem): ?><p class="recado ruim"><?= e($mensagem) ?></p><?php endif; ?>
        <button class="btn" type="submit">Instalar</button>
      </form>
    <?php else: ?>
      <p class="recado ruim">Resolva os itens marcados com ✗ e recarregue esta página.</p>
    <?php endif; ?>
  <?php endif; ?>
</main>
</body>
</html>
