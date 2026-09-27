<?php
/* ============================================================================
   AGENDA DE REUNIÕES POR VÍDEO
   Mesma regra que a agenda tinha na Netlify: o João define os dias e
   faixas de atendimento; o site mostra só o que está livre; o banco
   garante que dois visitantes nunca marquem o mesmo horário.
   Tudo em horário de Brasília (sem horário de verão desde 2019).
   ========================================================================= */
declare(strict_types=1);

final class Agenda
{
  public const ZONA = 'America/Sao_Paulo';
  public const PADRAO = [
    'duracao' => 50,       /* minutos por reunião: cabe na "uma hora" do cliente */
    'intervalo' => 10,     /* folga entre uma e outra: o passo fecha em 60 min */
    'antecedencia' => 4,   /* horas mínimas para marcar */
    'janela' => 21,        /* quantos dias à frente aparecem */
    'semana' => [          /* 0 = domingo */
      '1' => [['09:00', '12:00'], ['14:00', '18:00']],
      '2' => [['09:00', '12:00'], ['14:00', '18:00']],
      '3' => [['09:00', '12:00'], ['14:00', '18:00']],
      '4' => [['09:00', '12:00'], ['14:00', '18:00']],
      '5' => [['09:00', '12:00'], ['14:00', '17:00']],
    ],
    'bloqueios' => [],     /* datas YYYY-MM-DD inteiras */
    'sala' => '',          /* link fixo de reunião; vazio = uma sala nova por reunião */
  ];

  public static function config(): array
  {
    return array_merge(self::PADRAO, (array) Banco::opcao('agenda', []));
  }

  private static function min(string $hhmm): int { [$h, $m] = array_map('intval', explode(':', $hhmm) + [0, 0]); return $h * 60 + $m; }
  private static function hora(int $min): string { return sprintf('%02d:%02d', intdiv($min, 60), $min % 60); }

  public static function salvarConfig(array $c): array
  {
    $nova = [
      'duracao' => max(15, min(240, (int) ($c['duracao'] ?? 45))),
      'intervalo' => max(0, min(120, (int) ($c['intervalo'] ?? 0))),
      'antecedencia' => max(0, min(168, (int) ($c['antecedencia'] ?? 0))),
      'janela' => max(1, min(90, (int) ($c['janela'] ?? 21))),
      'semana' => [], 'bloqueios' => [],
      'sala' => preg_match('#^https://#', (string) ($c['sala'] ?? '')) ? Http::texto($c['sala'], 200) : '',
    ];
    for ($d = 0; $d <= 6; $d++) {
      $faixas = $c['semana'][(string) $d] ?? null;
      if (!is_array($faixas)) continue;
      $boas = [];
      foreach ($faixas as $f) {
        if (!is_array($f) || count($f) < 2) continue;
        if (!preg_match('/^\d{2}:\d{2}$/', (string) $f[0]) || !preg_match('/^\d{2}:\d{2}$/', (string) $f[1])) continue;
        if (self::min($f[1]) <= self::min($f[0])) continue;
        $boas[] = [$f[0], $f[1]];
      }
      if ($boas) $nova['semana'][(string) $d] = array_slice($boas, 0, 6);
    }
    foreach ((array) ($c['bloqueios'] ?? []) as $b) if (preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $b)) $nova['bloqueios'][] = $b;
    $nova['bloqueios'] = array_slice(array_values(array_unique($nova['bloqueios'])), 0, 200);
    Banco::definirOpcao('agenda', $nova);
    Auditoria::registrar('agenda_config');
    return $nova;
  }

  public static function horariosLivres(?array $cfg = null): array
  {
    $cfg ??= self::config();
    $tz = new DateTimeZone(self::ZONA);
    $agora = new DateTimeImmutable('now', $tz);
    $limite = $agora->modify('+' . (int) $cfg['antecedencia'] . ' hours');
    $hoje = $agora->format('Y-m-d');
    $ultimo = $agora->modify('+' . (int) $cfg['janela'] . ' days')->format('Y-m-d');

    $tomados = [];
    foreach (Banco::todos('SELECT dia, hora FROM reservas WHERE cancelada = 0 AND dia >= ? AND dia <= ?', [$hoje, $ultimo]) as $r) {
      $tomados[$r['dia'] . ' ' . $r['hora']] = true;
    }
    $passo = (int) $cfg['duracao'] + (int) $cfg['intervalo'];
    $dias = [];
    for ($i = 0; $i <= (int) $cfg['janela']; $i++) {
      $d = $agora->setTime(12, 0)->modify("+{$i} days");
      $dia = $d->format('Y-m-d');
      if (in_array($dia, $cfg['bloqueios'], true)) continue;
      $livres = [];
      foreach ($cfg['semana'][(string) (int) $d->format('w')] ?? [] as $f) {
        for ($m = self::min($f[0]); $m + (int) $cfg['duracao'] <= self::min($f[1]); $m += max(15, $passo)) {
          $h = self::hora($m);
          if (isset($tomados["$dia $h"])) continue;
          if (new DateTimeImmutable("$dia $h", $tz) < $limite) continue;
          $livres[] = $h;
        }
      }
      if ($livres) $dias[] = ['dia' => $dia, 'horas' => $livres];
    }
    return $dias;
  }

  public static function marcar(array $e): array
  {
    $dia = Http::texto($e['dia'] ?? '', 10);
    $hora = Http::texto($e['hora'] ?? '', 5);
    $nome = Http::texto($e['nome'] ?? '', 80);
    $fone = Http::digitos($e['whatsapp'] ?? '', 15);
    $assunto = Http::texto($e['assunto'] ?? '', 300);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dia) || !preg_match('/^\d{2}:\d{2}$/', $hora)) return [400, 'Data ou horário inválidos.'];
    if (mb_strlen($nome) < 2) return [400, 'Escreva seu nome.'];
    if (strlen($fone) < 10) return [400, 'Escreva um WhatsApp com DDD.'];

    $cfg = self::config();
    $doDia = array_values(array_filter(self::horariosLivres($cfg), fn($d) => $d['dia'] === $dia))[0] ?? null;
    if (!$doDia || !in_array($hora, $doDia['horas'], true)) return [409, 'Esse horário acabou de sair da agenda. Escolha outro.'];

    /* reunião marcada também é contato: entra no mesmo funil do formulário */
    $leadId = null;
    try {
      $n = Leads::normalizar(['nome' => $nome, 'whatsapp' => $fone, 'canal' => 'agenda', 'pagina' => '/agendar.html',
        'modalidade' => $e['modalidade'] ?? '', 'origem' => $e['origem'] ?? [],
        'mensagem' => 'Reunião ' . implode('/', array_reverse(explode('-', $dia))) . ' ' . $hora . ($assunto ? ' · ' . $assunto : '')]);
      if (isset($n['lead'])) { $r = Leads::registrar($n['lead']); $leadId = $r['id']; Avisos::novoContato($r['id'], $n['lead'], $r['repetido']); }
    } catch (Throwable $ex) { error_log('agenda→leads: ' . $ex->getMessage()); }

    $reserva = ['id' => Cripto::id(), 'dia' => $dia, 'hora' => $hora, 'vaga' => "$dia $hora",
      'dados_cripto' => Cripto::cifrarJson(['nome' => $nome, 'whatsapp' => $fone, 'assunto' => $assunto]),
      'sala' => $cfg['sala'] ?: ('https://meet.jit.si/astro-' . Cripto::token(6)),
      'lead_id' => $leadId, 'criada' => agora_iso(), 'cancelada' => 0];
    try { Banco::inserir('reservas', $reserva); }
    catch (PDOException $ex) {
      if (Banco::duplicado($ex)) return [409, 'Esse horário acabou de ser tomado. Escolha outro.'];
      throw $ex;
    }
    return [200, ['id' => $reserva['id'], 'dia' => $dia, 'hora' => $hora, 'sala' => $reserva['sala'], 'nome' => $nome]];
  }

  public static function reservas(): array
  {
    $desde = (new DateTimeImmutable('-30 days'))->format('Y-m-d');
    $out = [];
    foreach (Banco::todos('SELECT * FROM reservas WHERE dia >= ? ORDER BY dia, hora', [$desde]) as $r) {
      $p = Cripto::decifrarJson($r['dados_cripto']);
      $out[] = ['id' => $r['id'], 'dia' => $r['dia'], 'hora' => $r['hora'], 'sala' => $r['sala'],
        'cancelada' => (int) $r['cancelada'] === 1, 'lead_id' => $r['lead_id'],
        'nome' => $p['nome'] ?? '', 'whatsapp' => $p['whatsapp'] ?? '', 'assunto' => $p['assunto'] ?? ''];
    }
    return $out;
  }

  public static function cancelar(string $id): bool
  {
    $n = Banco::exec('UPDATE reservas SET cancelada = 1, vaga = NULL WHERE id = ? AND cancelada = 0', [$id]);
    if ($n) Auditoria::registrar('reuniao_cancelada', $id);
    return $n > 0;
  }
}
