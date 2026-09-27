<?php
/* Limite de tentativas por IP, guardado no banco (PHP não tem memória
   entre um pedido e outro). Protege formulário, agenda, Apollo e login de
   robô e de força bruta. */
declare(strict_types=1);

final class Limite
{
  public static function permitir(string $balde, int $teto, int $janelaSeg, ?string $quem = null): bool
  {
    $chave = substr($balde, 0, 20) . ':' . substr(hash('sha256', $balde . '|' . ($quem ?? Http::ip())), 0, 60);
    $agora = time();
    $r = Banco::um('SELECT inicio, contagem FROM limites WHERE chave = ?', [$chave]);
    if (!$r || (int) $r['inicio'] <= $agora - $janelaSeg) {
      Banco::exec('DELETE FROM limites WHERE chave = ?', [$chave]);
      try { Banco::inserir('limites', ['chave' => $chave, 'inicio' => $agora, 'contagem' => 1]); }
      catch (PDOException $e) { if (!Banco::duplicado($e)) throw $e; }
      return true;
    }
    if ((int) $r['contagem'] >= $teto) return false;
    Banco::exec('UPDATE limites SET contagem = contagem + 1 WHERE chave = ?', [$chave]);
    return true;
  }
}
