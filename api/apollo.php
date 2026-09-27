<?php
/* ============================================================================
   POST /api/apollo.php — pergunta ao Apollo, o assistente de dúvidas
   { pergunta, historico:[{de:'ia'|'eu', texto}] } → { resposta }
   ========================================================================= */
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';

if (Http::metodo() !== 'POST') Http::json(405, ['erro' => 'metodo nao permitido']);
Http::exigirMesmaOrigem();
Http::exigirJson();

/* O Apollo não precisa de banco para responder — só do limite de
   tentativas, que usa o banco quando ele existe. */
$comBanco = astro_configurado() && astro_instalado();
try {
  if ($comBanco && !Limite::permitir('apollo', 8, 60)) {
    Http::json(429, ['resposta' => 'Você mandou muitas perguntas seguidas. Espere um minuto, ou fale direto com a gente no WhatsApp.']);
  }
  $e = Http::entrada(12000);
  $r = Apollo::responder((string) ($e['pergunta'] ?? ''), is_array($e['historico'] ?? null) ? $e['historico'] : []);
  if (isset($r['erro'])) Http::json(400, $r);
  Http::json(200, $r);
} catch (Throwable $ex) {
  error_log('apollo: ' . $ex->getMessage());
  Http::json(200, ['resposta' => 'Não consegui responder agora. Fale com a gente no WhatsApp e responderemos o mais breve possível.']);
}
