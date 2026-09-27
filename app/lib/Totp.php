<?php
/* Verificação em duas etapas (RFC 6238) — o código de 6 dígitos do Google
   Authenticator, Microsoft Authenticator, Authy, 1Password… Sem biblioteca:
   é um HMAC-SHA1 do relógio. */
declare(strict_types=1);

final class Totp
{
  private const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  public static function novoSegredo(): string
  {
    $bytes = random_bytes(20);
    $bits = '';
    foreach (str_split($bytes) as $c) $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 5) as $grupo) $out .= self::ALFABETO[bindec(str_pad($grupo, 5, '0'))];
    return $out;
  }

  private static function decodificar(string $b32): string
  {
    $b32 = strtoupper(preg_replace('/[^A-Z2-7]/i', '', $b32) ?? '');
    $bits = '';
    foreach (str_split($b32) as $c) $bits .= str_pad(decbin(strpos(self::ALFABETO, $c)), 5, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 8) as $byte) if (strlen($byte) === 8) $out .= chr(bindec($byte));
    return $out;
  }

  public static function codigo(string $segredo, int $passo): string
  {
    $h = hash_hmac('sha1', pack('N*', 0, $passo), self::decodificar($segredo), true);
    $o = ord($h[19]) & 0x0f;
    $n = ((ord($h[$o]) & 0x7f) << 24) | (ord($h[$o + 1]) << 16) | (ord($h[$o + 2]) << 8) | ord($h[$o + 3]);
    return str_pad((string) ($n % 1000000), 6, '0', STR_PAD_LEFT);
  }

  /* Aceita o código do passo atual e de um passo antes/depois (relógio do
     celular um pouco fora). Devolve o passo usado — guardado para o mesmo
     código não servir duas vezes — ou null. */
  public static function verificar(string $segredo, string $codigo, ?int $ultimoUsado = null): ?int
  {
    $codigo = preg_replace('/\D/', '', $codigo) ?? '';
    if (strlen($codigo) !== 6) return null;
    $agora = intdiv(time(), 30);
    for ($d = -1; $d <= 1; $d++) {
      $p = $agora + $d;
      if ($ultimoUsado !== null && $p <= $ultimoUsado) continue;
      if (hash_equals(self::codigo($segredo, $p), $codigo)) return $p;
    }
    return null;
  }

  public static function uri(string $segredo, string $conta): string
  {
    return 'otpauth://totp/' . rawurlencode('Astro Consórcios:' . $conta) .
      '?secret=' . $segredo . '&issuer=' . rawurlencode('Astro Consórcios') . '&digits=6&period=30';
  }
}
