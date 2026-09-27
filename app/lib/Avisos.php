<?php
/* Aviso de "chegou contato novo" por e-mail e/ou webhook (Make, Zapier,
   n8n, Slack). Por padrão o aviso NÃO leva nome nem telefone: e-mail e
   ferramenta de terceiros não são lugar de dado pessoal. O aviso diz que
   chegou e manda abrir o painel, que tem senha. */
declare(strict_types=1);

final class Avisos
{
  private const NOMES = ['imovel' => 'Imóvel', 'carro' => 'Veículo', 'maquinario' => 'Maquinário',
                         'exterior' => 'Brasileiro no exterior', 'outro' => 'Não informado'];

  public static function novoContato(string $id, array $n, bool $repetido): void
  {
    $painel = rtrim((string) astro_config('site_url', ''), '/') . '/painel/#contato=' . $id;
    $linhas = [
      ($repetido ? 'Um contato voltou e atualizou o pedido.' : 'Novo pedido de simulação no site.'),
      'Modalidade: ' . (self::NOMES[$n['modalidade']] ?? $n['modalidade']),
      $n['valor'] ? 'Crédito: ' . $n['valor'] : '',
      $n['prazo'] ? 'Prazo: ' . $n['prazo'] : '',
      'Canal: ' . $n['canal'] . ($n['pagina'] ? ' (' . $n['pagina'] . ')' : ''),
      !empty($n['origem']['utm_source']) ? 'Campanha: ' . $n['origem']['utm_source'] . ' / ' . ($n['origem']['utm_campaign'] ?? '') : '',
      '',
      'Abra o painel: ' . $painel,
    ];
    $texto = implode("\n", array_filter($linhas, fn($l) => $l !== ''));

    self::email($repetido ? 'Contato atualizado — Astro' : 'Novo pedido de simulação — Astro', $texto);
    self::webhook($id, $n, $repetido, $texto);
  }

  private static function email(string $assunto, string $texto): void
  {
    $para = (string) astro_config('aviso_email', '');
    if (!filter_var($para, FILTER_VALIDATE_EMAIL)) return;
    $de = (string) astro_config('aviso_remetente', '');
    $cab = ['Content-Type: text/plain; charset=UTF-8'];
    if (filter_var($de, FILTER_VALIDATE_EMAIL)) $cab[] = 'From: Site Astro <' . $de . '>';
    try { @mail($para, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $texto, implode("\r\n", $cab)); }
    catch (Throwable $e) { error_log('aviso email: ' . $e->getMessage()); }
  }

  private static function webhook(string $id, array $n, bool $repetido, string $texto): void
  {
    $url = (string) astro_config('webhook_url', '');
    if (!preg_match('#^https://#', $url) || !function_exists('curl_init')) return;
    $corpo = ['evento' => $repetido ? 'contato_atualizado' : 'contato_novo', 'id' => $id, 'text' => $texto,
              'modalidade' => $n['modalidade'], 'valor' => $n['valor'], 'canal' => $n['canal'], 'pagina' => $n['pagina']];
    if (astro_config('webhook_com_dados', false)) $corpo['pessoal'] = $n['pessoal'];
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($corpo, JSON_UNESCAPED_UNICODE),
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 3]);
    curl_exec($c);
    if (curl_errno($c)) error_log('aviso webhook: ' . curl_error($c));
    curl_close($c);
  }
}
