<?php
/* ============================================================================
   SESSÃO DO PAINEL
   Cookie só por HTTPS, invisível para JavaScript (HttpOnly) e que não
   viaja em pedido vindo de outro site (SameSite=Strict). Arquivos de sessão
   em app/dados/sessoes — não no /tmp compartilhado da hospedagem.
   Sai sozinha após 30 min parada ou 10 h no total.
   ========================================================================= */
declare(strict_types=1);

final class Sessao
{
  private const OCIOSA = 1800;
  private const MAXIMA = 36000;

  public static function iniciar(): void
  {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $pasta = ASTRO_DADOS . '/sessoes';
    if (!is_dir($pasta)) @mkdir($pasta, 0700, true);
    if (is_dir($pasta) && is_writable($pasta)) session_save_path($pasta);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) self::MAXIMA);
    session_name(Http::https() ? '__Host-astro' : 'astro');
    session_set_cookie_params([
      'lifetime' => 0, 'path' => '/', 'secure' => Http::https(),
      'httponly' => true, 'samesite' => 'Strict',
    ]);
    session_start();

    $agora = time();
    $s = &$_SESSION;
    if (!empty($s['uid'])) {
      $expirou = ($agora - ($s['visto'] ?? 0) > self::OCIOSA) || ($agora - ($s['inicio'] ?? 0) > self::MAXIMA);
      if ($expirou) { self::limpar(); }
      else {
        $s['visto'] = $agora;
        /* troca o id de tempos em tempos: um id roubado envelhece rápido */
        if ($agora - ($s['renovado'] ?? 0) > 900) { session_regenerate_id(true); $s['renovado'] = $agora; }
      }
    }
    if (empty($s['csrf'])) $s['csrf'] = Cripto::token(24);
  }

  public static function csrf(): string { self::iniciar(); return (string) $_SESSION['csrf']; }

  /* todo pedido que muda algo precisa do cabeçalho X-CSRF igual ao da sessão */
  public static function exigirCsrf(): void
  {
    self::iniciar();
    $dado = (string) ($_SERVER['HTTP_X_CSRF'] ?? '');
    if ($dado === '' || !hash_equals((string) $_SESSION['csrf'], $dado)) {
      Http::json(403, ['ok' => false, 'mensagem' => 'Sessão expirada. Recarregue a página.']);
    }
  }

  public static function entrar(array $usuario): void
  {
    self::iniciar();
    session_regenerate_id(true);
    $agora = time();
    $_SESSION = ['uid' => $usuario['id'], 'inicio' => $agora, 'visto' => $agora, 'renovado' => $agora,
                 'csrf' => Cripto::token(24)];
  }

  /* meio caminho: senha certa, falta o código de 6 dígitos */
  public static function aguardar2fa(string $uid): void
  {
    self::iniciar();
    session_regenerate_id(true);
    $_SESSION['pendente2fa'] = ['uid' => $uid, 'ate' => time() + 300];
  }

  public static function pendente2fa(): ?string
  {
    self::iniciar();
    $p = $_SESSION['pendente2fa'] ?? null;
    if (!$p || ($p['ate'] ?? 0) < time()) { unset($_SESSION['pendente2fa']); return null; }
    return (string) $p['uid'];
  }

  public static function limpar(): void
  {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) session_regenerate_id(true);
  }

  public static function sair(): void
  {
    self::iniciar();
    self::limpar();
    $_SESSION['csrf'] = Cripto::token(24);
  }

  public static function usuarioId(): ?string
  {
    return session_status() === PHP_SESSION_ACTIVE ? ($_SESSION['uid'] ?? null) : null;
  }

  public static function usuario(): ?array
  {
    self::iniciar();
    $uid = $_SESSION['uid'] ?? null;
    if (!$uid) return null;
    $u = Banco::um('SELECT id, nome, email, papel, ativo, trocar_senha, totp_cripto FROM usuarios WHERE id = ?', [$uid]);
    if (!$u || !(int) $u['ativo']) { self::limpar(); return null; }
    $u['tem2fa'] = !empty($u['totp_cripto']);
    unset($u['totp_cripto']);
    return $u;
  }

  public static function exigirUsuario(?string $papel = null): array
  {
    $u = self::usuario();
    if (!$u) Http::json(401, ['ok' => false, 'mensagem' => 'Entre de novo para continuar.']);
    if ($papel && $u['papel'] !== $papel) Http::json(403, ['ok' => false, 'mensagem' => 'Seu usuário não tem acesso a isso.']);
    return $u;
  }
}
