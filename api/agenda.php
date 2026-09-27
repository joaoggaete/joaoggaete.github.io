<?php
/* ============================================================================
   /api/agenda.php — agenda pública de reuniões por vídeo
   GET  ?acao=horarios     → dias e horários livres
   POST {acao:'marcar', dia, hora, nome, whatsapp, assunto}
   A parte do João (configurar, ver e desmarcar) mora em /api/painel.php.
   ========================================================================= */
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';

astro_api_pronta();

try {
  if (Http::metodo() === 'GET') {
    if (!Limite::permitir('agenda-ver', 60, 60)) Http::json(429, ['ok' => false, 'mensagem' => 'Espere um minuto.']);
    $cfg = Agenda::config();
    Http::json(200, ['ok' => true, 'zona' => Agenda::ZONA, 'offset' => '-03:00',
      'duracao' => $cfg['duracao'], 'dias' => Agenda::horariosLivres($cfg)]);
  }
  if (Http::metodo() !== 'POST') Http::json(405, ['ok' => false]);
  Http::exigirMesmaOrigem();
  Http::exigirJson();
  $e = Http::entrada(6000);
  if (($e['acao'] ?? '') !== 'marcar') Http::json(400, ['ok' => false, 'mensagem' => 'Ação desconhecida.']);
  if (Http::texto($e['empresa_site'] ?? '', 80) !== '') Http::json(200, ['ok' => true]);
  if (!Limite::permitir('agenda-marcar', 6, 600)) Http::json(429, ['ok' => false, 'mensagem' => 'Muitas tentativas seguidas. Espere alguns minutos.']);

  [$codigo, $r] = Agenda::marcar($e);
  if ($codigo !== 200) Http::json($codigo, ['ok' => false, 'mensagem' => $r]);
  Http::json(200, ['ok' => true, 'reserva' => $r, 'zona' => Agenda::ZONA, 'offset' => '-03:00']);
} catch (Throwable $ex) {
  error_log('agenda: ' . $ex->getMessage());
  Http::json(200, ['ok' => false, 'motivo' => 'falha', 'mensagem' => 'Não consegui abrir a agenda agora. Fale com a gente no WhatsApp.']);
}
