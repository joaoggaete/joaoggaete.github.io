<?php
/* ============================================================================
   PONTO DE PARTIDA DO BACKEND
   Todo arquivo de /api e /painel começa com  require .../app/bootstrap.php.
   Feito para hospedagem compartilhada comum (Hostinger, Locaweb, HostGator,
   KingHost…): PHP 8.1+ e MySQL/MariaDB, sem Composer, sem Node, sem nada
   para instalar. Subiu os arquivos, preencheu o config, funcionou.
   ========================================================================= */
declare(strict_types=1);

if (PHP_VERSION_ID < 80100) {
  http_response_code(500);
  header('Content-Type: text/plain; charset=utf-8');
  exit('O site precisa de PHP 8.1 ou mais novo. Na Hostinger: hPanel → Avançado → Configuração do PHP.');
}

define('ASTRO_APP', __DIR__);
/* ASTRO_DADOS pode vir de fora só no teste no computador (TESTAR-NO-COMPUTADOR):
   assim chaves, banco de teste e instalado.lock ficam em teste-local/dados e
   nunca se misturam com a pasta que sobe para a hospedagem. */
define('ASTRO_DADOS', getenv('ASTRO_DADOS') ?: __DIR__ . '/dados');

/* Erro nunca aparece para o visitante (mostraria caminho de arquivo,
   consulta SQL…): vai para um log dentro de app/dados, que a web não lê. */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
if (!is_dir(ASTRO_DADOS . '/logs')) @mkdir(ASTRO_DADOS . '/logs', 0700, true);
ini_set('error_log', ASTRO_DADOS . '/logs/php-erros.log');
date_default_timezone_set('America/Sao_Paulo');

/* Segunda tranca: mesmo que um dia o .htaccess de app/ se perca num
   upload, a pasta de dados carrega a sua própria. */
if (is_dir(ASTRO_DADOS) && !is_file(ASTRO_DADOS . '/.htaccess')) {
  @file_put_contents(ASTRO_DADOS . '/.htaccess', "Require all denied\n");
}

spl_autoload_register(function (string $classe): void {
  $f = __DIR__ . '/lib/' . basename(str_replace('\\', '/', $classe)) . '.php';
  if (is_file($f)) require $f;
});

/* Onde o config pode estar, em ordem de preferência:
   1. variável ASTRO_CONFIG (testes automáticos)
   2. fora da pasta pública: ../astro-config.php em relação a public_html
   3. app/config.php */
function astro_config_caminho(): ?string {
  $opcoes = [];
  if (getenv('ASTRO_CONFIG')) $opcoes[] = (string) getenv('ASTRO_CONFIG');
  $opcoes[] = dirname(__DIR__, 2) . '/astro-config.php';
  $opcoes[] = __DIR__ . '/config.php';
  foreach ($opcoes as $c) if (is_file($c) && is_readable($c)) return $c;
  return null;
}

function astro_config(?string $chave = null, $padrao = null) {
  static $cfg = null;
  if ($cfg === null) {
    $caminho = astro_config_caminho();
    $cfg = $caminho ? (array) require $caminho : [];
  }
  if ($chave === null) return $cfg;
  return array_key_exists($chave, $cfg) ? $cfg[$chave] : $padrao;
}

function astro_configurado(): bool { return astro_config_caminho() !== null; }
function astro_instalado(): bool { return is_file(ASTRO_DADOS . '/instalado.lock'); }

function agora_iso(): string { return (new DateTimeImmutable('now'))->format(DATE_ATOM); }

/* Rotas da API chamam isto primeiro. Sem config ou sem instalação, a
   resposta é um "ok:false" educado: o site segue funcionando e cai no
   WhatsApp, em vez de mostrar erro para o visitante. */
function astro_api_pronta(): void {
  if (!astro_configurado() || !astro_instalado()) {
    Http::json(200, ['ok' => false, 'motivo' => 'sem-servidor',
      'mensagem' => 'Este recurso ainda não está ligado. Fale com a gente no WhatsApp.']);
  }
  try { Banco::pdo(); }
  catch (Throwable $e) {
    error_log('banco: ' . $e->getMessage());
    Http::json(200, ['ok' => false, 'motivo' => 'falha',
      'mensagem' => 'Não consegui registrar agora. Fale com a gente no WhatsApp.']);
  }
}
