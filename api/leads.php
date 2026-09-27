<?php
/* ============================================================================
   POST /api/leads.php — pedido de simulação vindo do site
   O front chama isto e, sem esperar a resposta, abre o WhatsApp com a
   mensagem pronta. Se o servidor falhar, o WhatsApp continua sendo o
   caminho; se o visitante desistir no WhatsApp, o contato já está salvo.
   ========================================================================= */
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';

if (Http::metodo() !== 'POST') Http::json(405, ['ok' => false]);
Http::exigirMesmaOrigem();
Http::exigirJson();
astro_api_pronta();

try {
  $e = Http::entrada(8000);

  /* campo-isca: invisível para gente, irresistível para robô. Responde
     "ok" para o robô não aprender que foi pego. */
  if (Http::texto($e['empresa_site'] ?? '', 80) !== '') Http::json(200, ['ok' => true]);

  if (!Limite::permitir('lead-min', 8, 60) || !Limite::permitir('lead-dia', 40, 86400)) {
    Http::json(429, ['ok' => false, 'mensagem' => 'Muitos envios seguidos. Espere um minuto.']);
  }
  $n = Leads::normalizar($e);
  if (isset($n['erro'])) Http::json(400, ['ok' => false, 'mensagem' => $n['erro']]);

  $r = Leads::registrar($n['lead']);
  Avisos::novoContato($r['id'], $n['lead'], $r['repetido']);
  Http::json(200, ['ok' => true, 'repetido' => $r['repetido']]);
} catch (Throwable $ex) {
  error_log('leads: ' . $ex->getMessage());
  Http::json(200, ['ok' => false, 'motivo' => 'falha', 'mensagem' => 'Não consegui registrar agora.']);
}
