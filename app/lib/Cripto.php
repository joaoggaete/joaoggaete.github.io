<?php
/* ============================================================================
   CRIPTOGRAFIA
   Nome, telefone, e-mail, mensagem e anotações de cada contato ficam
   CIFRADOS no banco (libsodium, XSalsa20-Poly1305, embutida no PHP). Quem
   conseguir uma cópia do banco — backup vazado, painel de hospedagem
   invadido — vê só lixo. A chave mora num arquivo à parte (app/dados/
   chaves.php), gerado na instalação.

   ⚠ GUARDE UMA CÓPIA DE app/dados/chaves.php FORA DO SERVIDOR. Sem ela, os
   dados cifrados não voltam mais — nem para você.

   Senhas não são cifradas, são "espalhadas" (hash): Argon2id quando o PHP
   da hospedagem tem, bcrypt custo 12 quando não tem — os dois dentro do
   recomendado pela OWASP. Antes do hash, a senha passa por um HMAC com uma
   "pimenta" que também fica em chaves.php: um banco vazado sozinho não
   serve nem para tentar adivinhar senha por força bruta.
   ========================================================================= */
declare(strict_types=1);

final class Cripto
{
  private const ARQUIVO = ASTRO_DADOS . '/chaves.php';
  private static ?array $chaves = null;

  public static function temChaves(): bool { return is_file(self::ARQUIVO); }

  public static function gerarChavesSeFaltar(): bool
  {
    if (self::temChaves()) return false;
    if (!is_dir(ASTRO_DADOS)) mkdir(ASTRO_DADOS, 0700, true);
    $conteudo = "<?php\n/* CHAVES DE CRIPTOGRAFIA — gerado em " . agora_iso() . ".\n" .
      "   Faça uma cópia deste arquivo FORA do servidor. Perdeu, perdeu os dados cifrados.\n" .
      "   Nunca mande por WhatsApp/e-mail nem suba para o Git. */\nreturn " . var_export([
        'versao' => 1,
        'dados'  => base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES)),
        'indice' => base64_encode(random_bytes(32)),
        'pimenta'=> base64_encode(random_bytes(32)),
      ], true) . ";\n";
    $tmp = self::ARQUIVO . '.' . bin2hex(random_bytes(4));
    file_put_contents($tmp, $conteudo, LOCK_EX);
    @chmod($tmp, 0600);
    rename($tmp, self::ARQUIVO);
    self::$chaves = null;
    return true;
  }

  private static function chave(string $qual): string
  {
    if (self::$chaves === null) {
      if (!self::temChaves()) throw new RuntimeException('chaves de criptografia ausentes');
      self::$chaves = (array) require self::ARQUIVO;
    }
    $v = base64_decode((string) (self::$chaves[$qual] ?? ''), true);
    if ($v === false || strlen($v) < 32) throw new RuntimeException('chave inválida: ' . $qual);
    return $v;
  }

  public static function cifrar(?string $texto): ?string
  {
    if ($texto === null || $texto === '') return null;
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    return 'v1:' . base64_encode($nonce . sodium_crypto_secretbox($texto, $nonce, self::chave('dados')));
  }

  public static function decifrar(?string $guardado): ?string
  {
    if ($guardado === null || $guardado === '' || !str_starts_with($guardado, 'v1:')) return null;
    $bruto = base64_decode(substr($guardado, 3), true);
    if ($bruto === false || strlen($bruto) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) return null;
    $nonce = substr($bruto, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $r = sodium_crypto_secretbox_open(substr($bruto, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $nonce, self::chave('dados'));
    return $r === false ? null : $r;
  }

  public static function cifrarJson(array $dados): ?string
  {
    return self::cifrar(json_encode($dados, JSON_UNESCAPED_UNICODE));
  }

  public static function decifrarJson(?string $guardado): array
  {
    $t = self::decifrar($guardado);
    $d = $t === null ? null : json_decode($t, true);
    return is_array($d) ? $d : [];
  }

  /* "Índice cego": permite achar o mesmo telefone (para juntar envios
     repetidos) sem guardar o telefone aberto. */
  public static function indice(string $valor): string
  {
    return hash_hmac('sha256', $valor, self::chave('indice'));
  }

  private static function apimentar(string $senha): string
  {
    /* 64 caracteres hex: cabe folgado no limite de 72 bytes do bcrypt */
    return hash_hmac('sha256', $senha, self::chave('pimenta'));
  }

  public static function senhaHash(string $senha): string
  {
    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    $opcoes = $algo === PASSWORD_BCRYPT ? ['cost' => 12]
      : ['memory_cost' => 65536, 'time_cost' => 3, 'threads' => 1];
    return password_hash(self::apimentar($senha), $algo, $opcoes);
  }

  public static function senhaConfere(string $senha, string $hash): bool
  {
    return password_verify(self::apimentar($senha), $hash);
  }

  public static function senhaPrecisaRefazer(string $hash): bool
  {
    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    $opcoes = $algo === PASSWORD_BCRYPT ? ['cost' => 12]
      : ['memory_cost' => 65536, 'time_cost' => 3, 'threads' => 1];
    return password_needs_rehash($hash, $algo, $opcoes);
  }

  public static function id(): string { return bin2hex(random_bytes(8)); }
  public static function token(int $bytes = 32): string { return bin2hex(random_bytes($bytes)); }
}
