<?php
/* ============================================================================
   /api/painel.php — tudo que o painel da equipe (/painel/) faz
   Sessão com cookie seguro + cabeçalho X-CSRF em todo pedido que muda algo.
   GET  ?acao=estado                    → logado?, usuário, token CSRF
   POST entrar {email, senha} | entrar2fa {codigo} | sair
   GET  contatos&meses=3 | resumo&meses=3 | contato_exportar&id= | contatos_csv (admin)
   POST contato_atualizar {id, etapa?, nota?, responsavel?, valor_fechado?} | contato_excluir {id}
   GET  agenda | POST agenda_config {config} (admin) | agenda_cancelar {id}
   GET  equipe (admin) | POST equipe_criar | equipe_atualizar | equipe_senha (admin)
   POST conta_senha | conta_2fa_iniciar | conta_2fa_ativar | conta_2fa_desativar
   GET  auditoria (admin)
   ========================================================================= */
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';

astro_api_pronta();
Sessao::iniciar();

$metodo = Http::metodo();
$e = $metodo === 'POST' ? Http::entrada(20000) : [];
$acao = Http::texto($_GET['acao'] ?? ($e['acao'] ?? ''), 30);

if ($metodo === 'POST') {
  Http::exigirMesmaOrigem();
  Http::exigirJson();
  Sessao::exigirCsrf();
}

function ok(array $d = []): never { Http::json(200, ['ok' => true] + $d); }
function recusa(string $m, int $c = 400): never { Http::json($c, ['ok' => false, 'mensagem' => $m]); }

try {
  switch ($acao) {

    /* ---------------- entrada ---------------- */
    case 'estado':
      $u = Sessao::usuario();
      ok(['logado' => (bool) $u, 'usuario' => $u, 'csrf' => Sessao::csrf(), 'pendente2fa' => !$u && Sessao::pendente2fa() !== null,
          'etapas' => Leads::ETAPAS]);

    case 'entrar':
      if ($metodo !== 'POST') recusa('Método inválido.', 405);
      $r = Usuarios::tentarEntrar((string) ($e['email'] ?? ''), (string) ($e['senha'] ?? ''));
      if (isset($r['erro'])) recusa($r['erro'], 401);
      if (!empty($r['precisa2fa'])) { Sessao::aguardar2fa($r['usuario']['id']); ok(['precisa2fa' => true, 'csrf' => Sessao::csrf()]); }
      Sessao::entrar($r['usuario']);
      Usuarios::registrarEntrada($r['usuario']);
      Manutencao::talvez();
      ok(['usuario' => Sessao::usuario(), 'csrf' => Sessao::csrf()]);

    case 'entrar2fa':
      if ($metodo !== 'POST') recusa('Método inválido.', 405);
      $uid = Sessao::pendente2fa();
      if (!$uid) recusa('O tempo para digitar o código acabou. Entre de novo.', 401);
      $u = Usuarios::confirmar2fa($uid, (string) ($e['codigo'] ?? ''));
      if (!$u) recusa('Código incorreto.', 401);
      Sessao::entrar($u);
      Usuarios::registrarEntrada($u);
      Manutencao::talvez();
      ok(['usuario' => Sessao::usuario(), 'csrf' => Sessao::csrf()]);

    case 'sair':
      if (Sessao::usuarioId()) Auditoria::registrar('logout');
      Sessao::sair();
      ok(['csrf' => Sessao::csrf()]);
  }

  /* daqui para baixo, só com sessão */
  $u = Sessao::exigirUsuario();
  $admin = $u['papel'] === 'admin';
  $meses = max(1, min(24, (int) ($_GET['meses'] ?? 3)));

  /* quem entrou com senha provisória só pode trocar a senha */
  if ((int) $u['trocar_senha'] === 1 && !in_array($acao, ['conta_senha'], true)) {
    recusa('Troque a senha provisória antes de continuar.', 428);
  }

  switch ($acao) {

    /* ---------------- contatos ---------------- */
    case 'contatos':
      ok(['contatos' => Leads::listar($u, $meses), 'etapas' => Leads::ETAPAS,
          'equipe' => array_map(fn($x) => ['id' => $x['id'], 'nome' => $x['nome']], array_filter(Usuarios::listar(), fn($x) => $x['ativo']))]);

    case 'resumo':
      ok(['resumo' => Leads::resumo($u, $meses)]);

    case 'contato_atualizar':
      $m = array_intersect_key($e, array_flip(['etapa', 'nota', 'responsavel', 'valor_fechado']));
      ok(['contato' => Leads::atualizar(Http::texto($e['id'] ?? '', 24), $m, $u)]);

    case 'contato_excluir':
      Leads::excluir(Http::texto($e['id'] ?? '', 24), $u, Http::texto($e['motivo'] ?? 'pedido do titular', 60));
      ok();

    case 'contato_exportar':
      ok(['contato' => Leads::exportar(Http::texto($_GET['id'] ?? '', 24), $u)]);

    case 'contatos_csv':
      if (!$admin) recusa('Só o administrador exporta a lista.', 403);
      $lista = Leads::listar($u, $meses);
      Auditoria::registrar('contatos_exportados', '', ['quantidade' => count($lista), 'meses' => $meses]);
      header('Content-Type: text/csv; charset=utf-8');
      header('Content-Disposition: attachment; filename="contatos-astro-' . date('Y-m-d') . '.csv"');
      Http::cabecalhosSeguranca();
      $out = fopen('php://output', 'w');
      fwrite($out, "\xEF\xBB\xBF"); /* BOM: o Excel abre acentuado certo */
      fputcsv($out, ['criado', 'etapa', 'nome', 'whatsapp', 'email', 'modalidade', 'valor', 'prazo', 'lance', 'canal', 'pagina', 'utm_source', 'utm_campaign', 'responsavel', 'valor_fechado'], ';', '"', '');
      foreach ($lista as $l) {
        $o = (array) $l['origem'];
        $linha = [$l['criado'], $l['etapa'], $l['nome'], $l['whatsapp'], $l['email'], $l['modalidade'], $l['valor'], $l['prazo'], $l['lance'],
          $l['canal'], $l['pagina'], $o['utm_source'] ?? '', $o['utm_campaign'] ?? '', $l['responsavel_nome'], $l['valor_fechado']];
        /* célula começando com = + - @ vira fórmula no Excel: neutraliza */
        fputcsv($out, array_map(fn($v) => preg_match('/^[=+\-@\t\r]/', (string) $v) ? "'" . $v : $v, $linha), ';', '"', '');
      }
      fclose($out);
      exit;

    /* ---------------- agenda ---------------- */
    case 'agenda':
      ok(['config' => Agenda::config(), 'reservas' => Agenda::reservas(), 'hoje' => (new DateTimeImmutable('now', new DateTimeZone(Agenda::ZONA)))->format('Y-m-d')]);

    case 'agenda_config':
      if (!$admin) recusa('Só o administrador muda a disponibilidade.', 403);
      ok(['config' => Agenda::salvarConfig((array) ($e['config'] ?? []))]);

    case 'agenda_cancelar':
      if (!Agenda::cancelar(Http::texto($e['id'] ?? '', 24))) recusa('Reunião não encontrada.', 404);
      ok();

    /* ---------------- equipe ---------------- */
    case 'equipe':
      if (!$admin) recusa('Só o administrador vê a equipe.', 403);
      ok(['equipe' => Usuarios::listar()]);

    case 'equipe_criar':
      if (!$admin) recusa('Só o administrador cria usuários.', 403);
      $novo = Usuarios::criar((string) ($e['nome'] ?? ''), (string) ($e['email'] ?? ''), (string) ($e['papel'] ?? 'consultor'), (string) ($e['senha'] ?? ''));
      Auditoria::registrar('usuario_criado', $novo['id'], ['papel' => $novo['papel']]);
      ok(['usuario' => Usuarios::publico($novo)]);

    case 'equipe_atualizar':
      if (!$admin) recusa('Só o administrador altera usuários.', 403);
      Usuarios::atualizar(Http::texto($e['id'] ?? '', 24), array_intersect_key($e, array_flip(['papel', 'ativo', 'nome'])), $u['id']);
      ok(['equipe' => Usuarios::listar()]);

    case 'equipe_senha':
      if (!$admin) recusa('Só o administrador redefine senhas.', 403);
      Usuarios::redefinirSenha(Http::texto($e['id'] ?? '', 24), (string) ($e['senha'] ?? ''));
      ok();

    /* ---------------- minha conta ---------------- */
    case 'conta_senha':
      Usuarios::trocarSenha($u['id'], (string) ($e['atual'] ?? ''), (string) ($e['nova'] ?? ''));
      Sessao::entrar(Banco::um('SELECT * FROM usuarios WHERE id = ?', [$u['id']]));
      ok(['usuario' => Sessao::usuario(), 'csrf' => Sessao::csrf()]);

    case 'conta_2fa_iniciar':
      ok(Usuarios::iniciar2fa($u['id']));

    case 'conta_2fa_ativar':
      if (!Usuarios::ativar2fa($u['id'], (string) ($e['codigo'] ?? ''))) recusa('Código incorreto ou expirado. Confira o relógio do celular e tente de novo.');
      ok(['usuario' => Sessao::usuario()]);

    case 'conta_2fa_desativar':
      Usuarios::desativar2fa($u['id'], (string) ($e['senha'] ?? ''));
      ok(['usuario' => Sessao::usuario()]);

    /* ---------------- auditoria ---------------- */
    case 'auditoria':
      if (!$admin) recusa('Só o administrador vê a auditoria.', 403);
      ok(['eventos' => Auditoria::listar(300)]);
  }
  recusa('Ação desconhecida.');
} catch (InvalidArgumentException $ex) {
  recusa($ex->getMessage());
} catch (Throwable $ex) {
  error_log('painel: ' . $ex->getMessage() . ' @ ' . $ex->getFile() . ':' . $ex->getLine());
  recusa('Algo deu errado no servidor. Tente de novo.', 500);
}
