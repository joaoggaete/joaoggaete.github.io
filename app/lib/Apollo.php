<?php
/* ============================================================================
   APOLLO — assistente de dúvidas do site (Gemini)
   A chave da IA vive no config do servidor, nunca no site: JavaScript de
   página é público. As regras (app/conhecimento.php) são o que impede o
   assistente de prometer prazo ou dar consultoria em nome de uma empresa
   que trabalha com produto fiscalizado pelo Banco Central.
   ========================================================================= */
declare(strict_types=1);

final class Apollo
{
  private const LIMITE_PERGUNTA = 400;
  private const LIMITE_HISTORICO = 6;
  private const WHATSAPP_MSG = 'Não consegui responder agora. Fale com a gente no WhatsApp e responderemos o mais breve possível.';

  /* Rede de segurança: mesmo com as regras, promessa de prazo, garantia ou
     link não chegam ao visitante. O modelo erra; esta camada não depende dele. */
  private const PROIBIDO = '/(https?:|wa\.me|em at[eé] \d+ ?(meses|dias|anos)|voc[eê] ser[aá] contemplad|garant(o|imos|ido|ida)|prometo)/iu';

  public static function responder(string $pergunta, array $historico): array
  {
    $chave = (string) astro_config('gemini_chave', '');
    if ($chave === '') {
      return ['resposta' => 'O Apollo ainda não está ligado. Fale com a gente no WhatsApp e responderemos o mais breve possível.', 'semChave' => true];
    }
    $pergunta = mb_substr(trim($pergunta), 0, self::LIMITE_PERGUNTA);
    if ($pergunta === '') return ['erro' => 'pergunta vazia'];

    $base = require ASTRO_APP . '/conhecimento.php';
    $conteudos = [];
    foreach (array_slice($historico, -self::LIMITE_HISTORICO) as $m) {
      $texto = mb_substr(trim((string) ($m['texto'] ?? '')), 0, self::LIMITE_PERGUNTA);
      if ($texto !== '') $conteudos[] = ['role' => (($m['de'] ?? '') === 'ia') ? 'model' : 'user', 'parts' => [['text' => $texto]]];
    }
    $conteudos[] = ['role' => 'user', 'parts' => [['text' => $pergunta]]];

    $pedido = [
      'systemInstruction' => ['parts' => [['text' => $base['regras'] . "\n\nMATERIAL (é tudo o que você sabe):\n" . $base['conhecimento']]]],
      'contents' => $conteudos,
      'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 2000, 'topP' => 0.8],
      'safetySettings' => array_map(fn($c) => ['category' => $c, 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
        ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']),
    ];
    /* O Google aposenta modelo a cada poucos meses; o nome fica no config
       para trocar sem mexer em código quando o próximo for desligado. */
    $modelo = preg_replace('/[^a-z0-9.\-]/i', '', (string) astro_config('gemini_modelo', 'gemini-3.5-flash'));
    $c = curl_init('https://generativelanguage.googleapis.com/v1beta/models/' . $modelo . ':generateContent');
    curl_setopt_array($c, [
      CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 5,
      /* chave no cabeçalho, nunca na URL: query string vaza em log */
      CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-goog-api-key: ' . $chave],
      CURLOPT_POSTFIELDS => json_encode($pedido, JSON_UNESCAPED_UNICODE),
    ]);
    $bruto = curl_exec($c);
    $status = (int) curl_getinfo($c, CURLINFO_HTTP_CODE);
    $erro = curl_error($c);
    curl_close($c);
    if ($bruto === false || $status !== 200) {
      error_log('apollo: gemini ' . $status . ' [' . $modelo . '] ' . ($erro ?: substr((string) $bruto, 0, 300)));
      return ['resposta' => self::WHATSAPP_MSG];
    }
    $j = json_decode((string) $bruto, true);
    $texto = trim(preg_replace('/\s+/u', ' ', (string) ($j['candidates'][0]['content']['parts'][0]['text'] ?? '')) ?? '');
    $fim = $j['candidates'][0]['finishReason'] ?? '';
    if ($fim && $fim !== 'STOP') error_log('apollo: terminou por ' . $fim . ' com ' . strlen($texto) . ' caracteres');

    if ($texto === '') $texto = 'Não tenho essa informação por aqui. Fale com a gente no WhatsApp.';
    elseif (preg_match(self::PROIBIDO, $texto)) {
      $texto = 'Essa parte depende do seu caso, e ninguém consegue prever prazo de contemplação. Fale com a gente no WhatsApp, que a análise é feita por uma pessoa.';
    }
    return ['resposta' => $texto];
  }
}
