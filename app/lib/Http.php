<?php
/* Entrada e saída das rotas: JSON, cabeçalhos de segurança, IP. */
declare(strict_types=1);

final class Http
{
  public static function cabecalhosSeguranca(): void
  {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header('X-Frame-Options: DENY');
    header('Cache-Control: no-store');
  }

  public static function json(int $codigo, array $corpo): never
  {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    self::cabecalhosSeguranca();
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
  }

  public static function metodo(): string { return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'); }

  /* corpo JSON, com teto de tamanho: ninguém precisa de mais que isso */
  public static function entrada(int $max = 16000): array
  {
    $bruto = file_get_contents('php://input', false, null, 0, $max + 1);
    if ($bruto === false || $bruto === '') return [];
    if (strlen($bruto) > $max) self::json(413, ['ok' => false, 'mensagem' => 'Pedido grande demais.']);
    $d = json_decode($bruto, true);
    return is_array($d) ? $d : [];
  }

  public static function ip(): string
  {
    $cab = (string) astro_config('ip_cabecalho', 'REMOTE_ADDR');
    $v = (string) ($_SERVER[$cab] ?? $_SERVER['REMOTE_ADDR'] ?? '');
    $v = trim(explode(',', $v)[0]);
    return filter_var($v, FILTER_VALIDATE_IP) ? $v : '0.0.0.0';
  }

  /* No registro de auditoria o IP entra "meio apagado": basta para ver um
     padrão de ataque, sem virar dado pessoal completo guardado por meses. */
  public static function ipMascarado(): string
  {
    $ip = self::ip();
    if (str_contains($ip, ':')) return implode(':', array_slice(explode(':', $ip), 0, 3)) . '::';
    $p = explode('.', $ip);
    $p[3] = '0';
    return implode('.', $p);
  }

  public static function https(): bool
  {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
      || (($_SERVER['SERVER_PORT'] ?? '') === '443')
      || (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https');
  }

  /* Pedido que muda alguma coisa só vale vindo do próprio site: o navegador
     manda "Origin" em todo POST de fetch, e outro site não consegue forjar. */
  public static function exigirMesmaOrigem(): void
  {
    $origem = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origem === '') return; /* navegador antigo ou chamada de servidor: segue para as outras travas */
    $hostOrigem = parse_url($origem, PHP_URL_HOST);
    $host = explode(':', (string) ($_SERVER['HTTP_HOST'] ?? ''))[0];
    if (!$hostOrigem || strcasecmp($hostOrigem, $host) !== 0) {
      self::json(403, ['ok' => false, 'mensagem' => 'Origem não permitida.']);
    }
  }

  public static function exigirJson(): void
  {
    $tipo = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (!str_starts_with($tipo, 'application/json')) {
      self::json(415, ['ok' => false, 'mensagem' => 'Envie JSON.']);
    }
  }

  public static function texto($v, int $max): string
  {
    $s = is_scalar($v) ? (string) $v : '';
    $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
  }

  public static function digitos($v, int $max = 15): string
  {
    return substr(preg_replace('/\D/', '', is_scalar($v) ? (string) $v : '') ?? '', 0, $max);
  }
}
