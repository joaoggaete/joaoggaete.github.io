<?php
/* ============================================================================
   CONTATOS (LEADS) — o funil comercial
   Todo pedido de simulação é gravado ANTES de o WhatsApp abrir. Até aqui,
   quem desistia de apertar "enviar" dentro do WhatsApp sumia sem rastro —
   justamente o contato mais caro (veio de anúncio, usou simulador, passou
   por três passos de formulário). Agora ele fica no painel.

   Dado pessoal (nome, WhatsApp, e-mail, mensagem, anotações) → cifrado.
   Dado de negócio (modalidade, faixa, prazo, etapa, campanha) → aberto,
   para o painel conseguir contar e filtrar sem decifrar nada.
   ========================================================================= */
declare(strict_types=1);

final class Leads
{
  public const ETAPAS = ['novo', 'contato', 'simulacao', 'reuniao', 'proposta', 'fechado', 'perdido'];
  public const MODALIDADES = ['imovel', 'carro', 'maquinario', 'exterior', 'outro'];
  public const CANAIS = ['formulario', 'agenda', 'contato', 'exterior', 'simulador'];
  private const JANELA_REPETIDO = 12 * 3600;

  public static function normalizar(array $d): array
  {
    $nome = Http::texto($d['nome'] ?? '', 80);
    /* até 15 dígitos: quem mora fora manda o número com o código do país */
    $fone = Http::digitos($d['whatsapp'] ?? '', 15);
    $email = mb_strtolower(Http::texto($d['email'] ?? '', 120));
    if (mb_strlen($nome) < 2) return ['erro' => 'Escreva seu nome.'];
    if (strlen($fone) < 10) return ['erro' => 'Escreva um WhatsApp com DDD.'];
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) return ['erro' => 'Confira o e-mail.'];

    $modalidade = Http::texto($d['modalidade'] ?? '', 20);
    if (!in_array($modalidade, self::MODALIDADES, true)) $modalidade = 'outro';
    $canal = Http::texto($d['canal'] ?? '', 20);
    if (!in_array($canal, self::CANAIS, true)) $canal = 'formulario';

    $origem = [];
    foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'referrer', 'entrada'] as $k) {
      $v = Http::texto(($d['origem'][$k] ?? '') ?: '', in_array($k, ['referrer', 'entrada'], true) ? 200 : 120);
      if ($v !== '') $origem[$k] = $v;
    }

    return ['lead' => [
      'pessoal' => array_filter(['nome' => $nome, 'whatsapp' => $fone, 'email' => $email,
                                 'mensagem' => Http::texto($d['mensagem'] ?? '', 600)], fn($v) => $v !== ''),
      'modalidade' => $modalidade,
      'valor' => Http::texto($d['valor'] ?? '', 40),
      'prazo' => Http::texto($d['prazo'] ?? '', 30),
      'lance' => Http::texto($d['lance'] ?? '', 30),
      'canal' => $canal,
      'pagina' => Http::texto($d['pagina'] ?? '', 120),
      'origem' => $origem,
    ]];
  }

  private static function historico(?string $json, string $evento, string $detalhe = '', ?string $por = null): string
  {
    $h = json_decode((string) $json, true);
    $h = is_array($h) ? $h : [];
    $h[] = array_filter(['quando' => agora_iso(), 'evento' => $evento, 'detalhe' => $detalhe, 'por' => $por], fn($v) => $v !== null && $v !== '');
    return json_encode(array_slice($h, -40), JSON_UNESCAPED_UNICODE);
  }

  /* Grava. O mesmo WhatsApp de novo em até 12 h é o MESMO contato (voltou,
     trocou o valor, apertou duas vezes): junta no registro existente. */
  public static function registrar(array $n): array
  {
    $indice = Cripto::indice($n['pessoal']['whatsapp']);
    $limite = (new DateTimeImmutable('-' . self::JANELA_REPETIDO . ' seconds'))->format(DATE_ATOM);
    $anterior = Banco::um('SELECT * FROM leads WHERE fone_indice = ? AND excluido IS NULL AND atualizado > ? ORDER BY atualizado DESC LIMIT 1', [$indice, $limite]);
    $agora = agora_iso();

    if ($anterior) {
      $pessoal = array_merge(Cripto::decifrarJson($anterior['dados_cripto']), $n['pessoal']);
      $mud = ['dados_cripto' => Cripto::cifrarJson($pessoal), 'atualizado' => $agora,
              'historico' => self::historico($anterior['historico'], 'reenvio', $n['canal'] . ($n['pagina'] ? ' · ' . $n['pagina'] : ''))];
      foreach (['valor', 'prazo', 'lance'] as $k) if ($n[$k] !== '') $mud[$k] = $n[$k];
      if ($n['modalidade'] !== 'outro') $mud['modalidade'] = $n['modalidade'];
      Banco::atualizar('leads', $anterior['id'], $mud);
      return ['id' => $anterior['id'], 'repetido' => true];
    }

    $id = Cripto::id();
    Banco::inserir('leads', [
      'id' => $id, 'criado' => $agora, 'atualizado' => $agora, 'etapa' => 'novo',
      'modalidade' => $n['modalidade'], 'valor' => $n['valor'], 'prazo' => $n['prazo'], 'lance' => $n['lance'],
      'canal' => $n['canal'], 'pagina' => $n['pagina'],
      'origem' => $n['origem'] ? json_encode($n['origem'], JSON_UNESCAPED_UNICODE) : null,
      'dados_cripto' => Cripto::cifrarJson($n['pessoal']), 'fone_indice' => $indice,
      'historico' => self::historico(null, 'criado', $n['canal']),
    ]);
    return ['id' => $id, 'repetido' => false];
  }

  /* o que o painel mostra de um contato */
  private static function abrir(array $l, array $nomes = []): array
  {
    $p = Cripto::decifrarJson($l['dados_cripto']);
    return [
      'id' => $l['id'], 'criado' => $l['criado'], 'atualizado' => $l['atualizado'], 'etapa' => $l['etapa'],
      'modalidade' => $l['modalidade'], 'valor' => $l['valor'], 'prazo' => $l['prazo'], 'lance' => $l['lance'],
      'canal' => $l['canal'], 'pagina' => $l['pagina'],
      'origem' => json_decode((string) $l['origem'], true) ?: new stdClass(),
      'nome' => $p['nome'] ?? '', 'whatsapp' => $p['whatsapp'] ?? '', 'email' => $p['email'] ?? '', 'mensagem' => $p['mensagem'] ?? '',
      'nota' => Cripto::decifrar($l['nota_cripto']) ?? '',
      'responsavel' => $l['responsavel'], 'responsavel_nome' => $l['responsavel'] ? ($nomes[$l['responsavel']] ?? '') : '',
      'valor_fechado' => $l['valor_fechado'] ?? '',
      'historico' => json_decode((string) $l['historico'], true) ?: [],
    ];
  }

  private static function nomesEquipe(): array
  {
    $n = [];
    foreach (Banco::todos('SELECT id, nome FROM usuarios') as $u) $n[$u['id']] = $u['nome'];
    return $n;
  }

  private static function filtroAcesso(array $usuario, array &$p): string
  {
    if ($usuario['papel'] === 'admin') return '';
    $p[] = $usuario['id'];
    return ' AND (responsavel IS NULL OR responsavel = ?)';
  }

  public static function listar(array $usuario, int $meses = 3): array
  {
    $desde = (new DateTimeImmutable('first day of this month'))->modify('-' . max(0, min(24, $meses) - 1) . ' months')->format('Y-m-01');
    $p = [$desde];
    $sql = 'SELECT * FROM leads WHERE excluido IS NULL AND criado >= ?' . self::filtroAcesso($usuario, $p) . ' ORDER BY criado DESC LIMIT 2000';
    $nomes = self::nomesEquipe();
    return array_map(fn($l) => self::abrir($l, $nomes), Banco::todos($sql, $p));
  }

  private static function buscar(string $id, array $usuario): array
  {
    $p = [$id];
    $l = Banco::um('SELECT * FROM leads WHERE id = ? AND excluido IS NULL' . self::filtroAcesso($usuario, $p), $p);
    if (!$l) throw new InvalidArgumentException('Contato não encontrado.');
    return $l;
  }

  public static function atualizar(string $id, array $m, array $usuario): array
  {
    $l = self::buscar($id, $usuario);
    $mud = [];
    $hist = $l['historico'];
    if (isset($m['etapa']) && in_array($m['etapa'], self::ETAPAS, true) && $m['etapa'] !== $l['etapa']) {
      $hist = self::historico($hist, 'etapa', $l['etapa'] . ' → ' . $m['etapa'], $usuario['nome']);
      $mud['etapa'] = $m['etapa'];
      /* quem mexe primeiro num contato sem dono vira o responsável */
      if (!$l['responsavel']) $mud['responsavel'] = $usuario['id'];
    }
    if (array_key_exists('nota', $m) && is_string($m['nota'])) {
      $mud['nota_cripto'] = Cripto::cifrar(mb_substr($m['nota'], 0, 4000));
    }
    if (array_key_exists('valor_fechado', $m)) $mud['valor_fechado'] = Http::texto($m['valor_fechado'], 40);
    if (array_key_exists('responsavel', $m)) {
      $novo = $m['responsavel'] ?: null;
      if ($usuario['papel'] !== 'admin' && $novo !== $usuario['id']) throw new InvalidArgumentException('Só o administrador distribui contatos para outra pessoa.');
      if ($novo && !Banco::um('SELECT id FROM usuarios WHERE id = ? AND ativo = 1', [$novo])) throw new InvalidArgumentException('Responsável inválido.');
      $mud['responsavel'] = $novo;
      $hist = self::historico($hist, 'responsavel', $novo ? (self::nomesEquipe()[$novo] ?? '') : 'sem responsável', $usuario['nome']);
    }
    if (!$mud) return self::abrir($l, self::nomesEquipe());
    $mud['historico'] = $hist;
    $mud['atualizado'] = agora_iso();
    Banco::atualizar('leads', $id, $mud);
    return self::abrir(self::buscar($id, ['papel' => 'admin', 'id' => '']), self::nomesEquipe());
  }

  /* Pedido de exclusão (LGPD, art. 18): apaga o dado pessoal de verdade e
     guarda só o que não identifica ninguém, para os números do funil não
     mudarem sozinhos. */
  public static function excluir(string $id, array $usuario, string $motivo = 'pedido'): void
  {
    self::buscar($id, $usuario);
    Banco::atualizar('leads', $id, ['dados_cripto' => null, 'nota_cripto' => null, 'fone_indice' => null,
      'origem' => null, 'historico' => null, 'excluido' => agora_iso(), 'atualizado' => agora_iso()]);
    Auditoria::registrar('lead_excluido', $id, ['motivo' => $motivo]);
  }

  /* Portabilidade/acesso (LGPD, art. 18): tudo que existe sobre a pessoa */
  public static function exportar(string $id, array $usuario): array
  {
    $l = self::abrir(self::buscar($id, $usuario), self::nomesEquipe());
    Auditoria::registrar('lead_exportado', $id);
    return $l;
  }

  public static function resumo(array $usuario, int $meses = 3): array
  {
    $leads = self::listar($usuario, $meses);
    $conta = fn(callable $chave) => array_count_values(array_map($chave, $leads)) ?: new stdClass();
    $origem = function ($l) {
      $o = (array) $l['origem'];
      if (!empty($o['utm_source'])) return $o['utm_source'] . (!empty($o['utm_campaign']) ? ' / ' . $o['utm_campaign'] : '');
      if (!empty($o['gclid'])) return 'google (anúncio)';
      if (!empty($o['fbclid'])) return 'meta (anúncio)';
      if (!empty($o['referrer'])) return parse_url($o['referrer'], PHP_URL_HOST) ?: 'outro site';
      return 'direto';
    };
    $fechados = count(array_filter($leads, fn($l) => $l['etapa'] === 'fechado'));
    return [
      'total' => count($leads),
      'fechados' => $fechados,
      'conversao' => $leads ? round(100 * $fechados / count($leads), 1) : 0,
      'porEtapa' => $conta(fn($l) => $l['etapa']),
      'porModalidade' => $conta(fn($l) => $l['modalidade']),
      'porCanal' => $conta(fn($l) => $l['canal']),
      'porOrigem' => $conta($origem),
      'porPagina' => $conta(fn($l) => $l['pagina'] ?: '—'),
    ];
  }
}
