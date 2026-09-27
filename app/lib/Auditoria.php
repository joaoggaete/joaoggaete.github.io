<?php
/* Trilha de auditoria: quem entrou, quem viu/exportou/apagou dado de quem.
   É o que responde "quem mexeu nisso?" — e o que a LGPD espera que exista
   quando alguém pergunta o que foi feito com os próprios dados. */
declare(strict_types=1);

final class Auditoria
{
  public static function registrar(string $acao, string $alvo = '', array $detalhe = [], ?string $usuarioId = null): void
  {
    try {
      Banco::inserir('auditoria', [
        'id' => Cripto::id(),
        'quando' => agora_iso(),
        'usuario_id' => $usuarioId ?? Sessao::usuarioId(),
        'acao' => substr($acao, 0, 40),
        'alvo' => substr($alvo, 0, 60),
        'ip' => Http::ipMascarado(),
        'detalhe' => $detalhe ? json_encode($detalhe, JSON_UNESCAPED_UNICODE) : null,
      ]);
    } catch (Throwable $e) {
      error_log('auditoria: ' . $e->getMessage());
    }
  }

  public static function listar(int $limite = 200): array
  {
    return Banco::todos(
      'SELECT a.quando, a.acao, a.alvo, a.ip, a.detalhe, u.nome AS usuario
         FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
        ORDER BY a.quando DESC LIMIT ' . max(1, min(1000, $limite)));
  }
}
