/* ============================================================================
   PAINEL DA EQUIPE — contatos, funil, agenda, equipe, auditoria, conta.
   Tudo que vem de visitante (nome, mensagem…) entra na tela por
   textContent, nunca por innerHTML: um nome como <img onerror=…> vira texto,
   não código.
   ========================================================================= */
(function () {
  'use strict';

  var API = '/api/painel.php';
  var estado = { csrf: '', usuario: null, etapas: [], contatos: [], equipe: [], filtroEtapa: '', agenda: null };
  var NOMES_ETAPA = { novo: 'Novo', contato: 'Em contato', simulacao: 'Simulação enviada', reuniao: 'Reunião',
    proposta: 'Proposta', fechado: 'Fechado', perdido: 'Perdido' };
  var NOMES_MOD = { imovel: 'Imóvel', carro: 'Veículo', maquinario: 'Maquinário', exterior: 'Exterior', outro: 'Não informado' };
  var NOMES_VALOR = { '50-100': 'R$ 50–100 mil', '100-200': 'R$ 100–200 mil', '200-300': 'R$ 200–300 mil', '300-600': 'R$ 300–600 mil',
    '600-1m': 'R$ 600 mil–1 mi', '1m-2m': 'R$ 1–2 mi', '2m+': 'acima de R$ 2 mi' };
  function valorTexto(v) { return NOMES_VALOR[v] || v || ''; }
  var SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'texto') el.textContent = v;
      else if (k === 'classe') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }
  function limpa(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function recado(el, texto, bom) {
    el.textContent = texto; el.className = 'recado ' + (bom ? 'bom' : 'ruim'); el.hidden = false;
    clearTimeout(el._t); el._t = setTimeout(function () { el.hidden = true; }, 5000);
  }
  function dataHora(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  }

  /* ---------------- conversa com o servidor ---------------- */
  function pedir(acao, corpo, metodo) {
    metodo = metodo || (corpo ? 'POST' : 'GET');
    var url = API + (metodo === 'GET' ? '?acao=' + encodeURIComponent(acao) + (corpo ? '&' + new URLSearchParams(corpo) : '') : '');
    var op = { method: metodo, credentials: 'same-origin', headers: { 'X-CSRF': estado.csrf } };
    if (metodo === 'POST') {
      op.headers['Content-Type'] = 'application/json';
      op.body = JSON.stringify(Object.assign({ acao: acao }, corpo || {}));
    }
    return fetch(url, op).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (b && b.csrf) estado.csrf = b.csrf;
        if (r.status === 401 && acao !== 'entrar' && acao !== 'entrar2fa') { mostraEntrar(); }
        if (r.status === 428) { mostraTrocar(); }
        return { status: r.status, b: b || {} };
      });
    }).catch(function () {
      return { status: 0, b: { mensagem: 'Sem conexão com o servidor.' } };
    });
  }

  /* ---------------- telas ---------------- */
  function so(tela) {
    ['telaEntrar', 'telaTrocar', 'telaPainel'].forEach(function (t) { $(t).hidden = t !== tela; });
  }
  function mostraEntrar(pendente2fa) {
    so('telaEntrar');
    $('formEntrar').hidden = !!pendente2fa;
    $('form2fa').hidden = !pendente2fa;
    (pendente2fa ? $('entCodigo') : $('entEmail')).focus();
  }
  function mostraTrocar() { so('telaTrocar'); $('trAtual').focus(); }
  function mostraPainel() {
    so('telaPainel');
    var admin = estado.usuario.papel === 'admin';
    document.querySelectorAll('[data-admin]').forEach(function (el) { el.hidden = !admin; });
    $('quemNome').textContent = estado.usuario.nome + (admin ? ' · admin' : '');
    abrirAba(location.hash.indexOf('#contato=') === 0 ? 'contatos' : 'contatos');
  }

  function iniciar() {
    if (location.protocol === 'file:') {
      document.body.textContent = 'Abra o painel pelo endereço do site (https://…/painel/), não pelo arquivo do computador.';
      return;
    }
    pedir('estado').then(function (r) {
      if (r.b.motivo === 'sem-servidor') {
        so('telaEntrar');
        $('formEntrar').hidden = true;
        recado($('entErro'), 'O servidor ainda não foi instalado. Abra /painel/instalar.php.', false);
        $('entErro').hidden = false;
        return;
      }
      estado.etapas = r.b.etapas || [];
      if (r.b.logado) {
        estado.usuario = r.b.usuario;
        if (+estado.usuario.trocar_senha) mostraTrocar(); else mostraPainel();
      } else mostraEntrar(r.b.pendente2fa);
    });
  }

  $('formEntrar').addEventListener('submit', function (ev) {
    ev.preventDefault();
    pedir('entrar', { email: $('entEmail').value, senha: $('entSenha').value }).then(function (r) {
      $('entSenha').value = '';
      if (r.b.precisa2fa) return mostraEntrar(true);
      if (!r.b.ok) return recado($('entErro'), r.b.mensagem || 'Não consegui entrar.', false);
      estado.usuario = r.b.usuario;
      if (+estado.usuario.trocar_senha) mostraTrocar(); else mostraPainel();
    });
  });
  $('form2fa').addEventListener('submit', function (ev) {
    ev.preventDefault();
    pedir('entrar2fa', { codigo: $('entCodigo').value }).then(function (r) {
      $('entCodigo').value = '';
      if (!r.b.ok) { recado($('entErro2'), r.b.mensagem || 'Código incorreto.', false); if (r.status === 401 && /tempo/.test(r.b.mensagem || '')) mostraEntrar(false); return; }
      estado.usuario = r.b.usuario;
      if (+estado.usuario.trocar_senha) mostraTrocar(); else mostraPainel();
    });
  });
  $('formTrocar').addEventListener('submit', function (ev) {
    ev.preventDefault();
    pedir('conta_senha', { atual: $('trAtual').value, nova: $('trNova').value }).then(function (r) {
      if (!r.b.ok) return recado($('trErro'), r.b.mensagem || 'Não consegui trocar.', false);
      $('trAtual').value = $('trNova').value = '';
      estado.usuario = r.b.usuario; mostraPainel();
    });
  });
  $('sair').addEventListener('click', function () {
    pedir('sair', {}).then(function () { estado.usuario = null; mostraEntrar(false); });
  });

  /* ---------------- abas ---------------- */
  var carregadores = {
    contatos: carregaContatos, funil: carregaFunil, agenda: carregaAgenda,
    equipe: carregaEquipe, auditoria: carregaAuditoria, conta: pintaConta
  };
  function abrirAba(nome) {
    document.querySelectorAll('#abas button').forEach(function (b) { b.classList.toggle('ativa', b.dataset.aba === nome); });
    document.querySelectorAll('.aba').forEach(function (s) { s.hidden = s.id !== 'aba-' + nome; });
    (carregadores[nome] || function () {})();
  }
  $('abas').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-aba]');
    if (b) abrirAba(b.dataset.aba);
  });

  /* ---------------- contatos ---------------- */
  function carregaContatos() {
    pedir('contatos', { meses: $('fMeses').value }, 'GET').then(function (r) {
      if (!r.b.ok) return;
      estado.contatos = r.b.contatos || [];
      estado.etapas = r.b.etapas || estado.etapas;
      estado.equipe = r.b.equipe || [];
      pintaContatos();
      var m = /^#contato=([a-f0-9]+)/.exec(location.hash);
      if (m) { var c = estado.contatos.filter(function (x) { return x.id === m[1]; })[0]; if (c) abreDetalhe(c); history.replaceState(null, '', location.pathname); }
    });
  }
  ['fMeses'].forEach(function (id) { $(id).addEventListener('change', carregaContatos); });
  ['fModalidade', 'fMeus'].forEach(function (id) { $(id).addEventListener('change', pintaContatos); });
  $('fBusca').addEventListener('input', pintaContatos);

  function origemTexto(o) {
    o = o || {};
    if (o.utm_source) return o.utm_source + (o.utm_campaign ? ' / ' + o.utm_campaign : '');
    if (o.gclid) return 'Google Ads';
    if (o.fbclid) return 'Meta Ads';
    if (o.referrer) { try { return new URL(o.referrer).hostname; } catch (e) { return 'outro site'; } }
    return 'direto';
  }
  function filtrados() {
    var mod = $('fModalidade').value, busca = $('fBusca').value.trim().toLowerCase(), meus = $('fMeus').checked;
    return estado.contatos.filter(function (c) {
      if (estado.filtroEtapa && c.etapa !== estado.filtroEtapa) return false;
      if (mod && c.modalidade !== mod) return false;
      if (meus && c.responsavel !== estado.usuario.id) return false;
      if (busca) {
        var alvo = [c.nome, c.whatsapp, c.email, c.valor, c.pagina, origemTexto(c.origem), c.mensagem].join(' ').toLowerCase();
        if (alvo.indexOf(busca) < 0) return false;
      }
      return true;
    });
  }
  function pintaContatos() {
    var chips = limpa($('chipsEtapa'));
    var conta = {};
    estado.contatos.forEach(function (c) { conta[c.etapa] = (conta[c.etapa] || 0) + 1; });
    chips.appendChild(h('button', { type: 'button', classe: estado.filtroEtapa ? '' : 'ativa',
      onclick: function () { estado.filtroEtapa = ''; pintaContatos(); } }, 'Todos', h('b', { texto: String(estado.contatos.length) })));
    estado.etapas.forEach(function (et) {
      chips.appendChild(h('button', { type: 'button', classe: estado.filtroEtapa === et ? 'ativa' : '',
        onclick: function () { estado.filtroEtapa = estado.filtroEtapa === et ? '' : et; pintaContatos(); } },
        NOMES_ETAPA[et] || et, h('b', { texto: String(conta[et] || 0) })));
    });

    var lista = filtrados(), corpo = limpa($('listaContatos'));
    $('semContatos').hidden = lista.length > 0;
    lista.forEach(function (c) {
      var sel = h('select', { 'aria-label': 'Etapa de ' + c.nome, onclick: function (e) { e.stopPropagation(); },
        onchange: function () { salvaContato(c, { etapa: sel.value }); } });
      estado.etapas.forEach(function (et) { sel.appendChild(h('option', { value: et, selected: et === c.etapa, texto: NOMES_ETAPA[et] || et })); });
      var tr = h('tr', { classe: 'clicavel', onclick: function () { abreDetalhe(c); } },
        h('td', { classe: 'quando', texto: dataHora(c.criado) }),
        h('td', null, h('strong', { texto: c.nome || '(excluído)' }), h('small', { texto: formataFone(c.whatsapp) })),
        h('td', null, NOMES_MOD[c.modalidade] || c.modalidade, h('small', { texto: [valorTexto(c.valor), c.prazo].filter(Boolean).join(' · ') })),
        h('td', null, origemTexto(c.origem), h('small', { texto: c.canal + (c.pagina ? ' · ' + c.pagina : '') })),
        h('td', null, sel),
        h('td', { texto: c.responsavel_nome || '—' }),
        h('td', null, botaoZap(c, true)));
      corpo.appendChild(tr);
    });
  }
  function formataFone(f) {
    f = String(f || '');
    if (f.length === 11) return '(' + f.slice(0, 2) + ') ' + f.slice(2, 7) + '-' + f.slice(7);
    if (f.length === 10) return '(' + f.slice(0, 2) + ') ' + f.slice(2, 6) + '-' + f.slice(6);
    return f;
  }
  function linkZap(c) {
    var num = String(c.whatsapp || '');
    if (num.length <= 11) num = '55' + num;
    var primeiro = (c.nome || '').split(' ')[0];
    var interesse = { imovel: 'imóvel', carro: 'veículo', maquinario: 'maquinário' }[c.modalidade];
    var txt = 'Olá' + (primeiro ? ', ' + primeiro : '') + '! Aqui é ' + estado.usuario.nome.split(' ')[0] +
      ', da Astro Consórcios. Recebi o seu pedido de simulação' + (interesse ? ' de ' + interesse : '') +
      ' e já estou olhando o seu caso. Posso te fazer duas perguntas rápidas?';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(txt);
  }
  function botaoZap(c, pequeno) {
    if (!c.whatsapp) return null;
    return h('a', { classe: 'btn zap' + (pequeno ? ' pequeno' : ''), href: linkZap(c), target: '_blank', rel: 'noopener noreferrer',
      onclick: function (e) { e.stopPropagation(); if (c.etapa === 'novo') salvaContato(c, { etapa: 'contato' }); } }, 'WhatsApp');
  }
  function salvaContato(c, mudancas, depois) {
    return pedir('contato_atualizar', Object.assign({ id: c.id }, mudancas)).then(function (r) {
      if (!r.b.ok) { alert(r.b.mensagem || 'Não consegui salvar.'); return; }
      var i = estado.contatos.indexOf(c);
      if (i >= 0) estado.contatos[i] = r.b.contato;
      pintaContatos();
      if (depois) depois(r.b.contato);
    });
  }

  function abreDetalhe(c) {
    var d = $('detalhe'), corpo = limpa($('detalheCorpo'));
    var admin = estado.usuario.papel === 'admin';
    var o = c.origem || {};
    corpo.appendChild(h('h3', { id: 'dtNome', texto: c.nome || '(dados excluídos)' }));
    corpo.appendChild(h('p', { classe: 'nota', texto: 'Chegou em ' + dataHora(c.criado) + ' pelo ' + c.canal + (c.pagina ? ' (' + c.pagina + ')' : '') }));
    var dl = h('dl');
    [['WhatsApp', formataFone(c.whatsapp)], ['E-mail', c.email], ['Modalidade', NOMES_MOD[c.modalidade]], ['Crédito', valorTexto(c.valor)],
     ['Prazo', c.prazo], ['Reserva p/ lance', c.lance], ['Mensagem', c.mensagem], ['Origem', origemTexto(o)],
     ['Página de entrada', o.entrada], ['Anúncio', o.utm_content || o.utm_term]].forEach(function (p) {
      if (p[1]) { dl.appendChild(h('dt', { texto: p[0] })); dl.appendChild(h('dd', { texto: p[1] })); }
    });
    corpo.appendChild(dl);

    var etapa = h('select');
    estado.etapas.forEach(function (et) { etapa.appendChild(h('option', { value: et, selected: et === c.etapa, texto: NOMES_ETAPA[et] || et })); });
    var resp = h('select', { disabled: !admin && c.responsavel && c.responsavel !== estado.usuario.id });
    resp.appendChild(h('option', { value: '', texto: 'Sem responsável' }));
    estado.equipe.forEach(function (u) {
      if (!admin && u.id !== estado.usuario.id) return;
      resp.appendChild(h('option', { value: u.id, selected: u.id === c.responsavel, texto: u.nome }));
    });
    var fechado = h('input', { value: c.valor_fechado || '', placeholder: 'R$ 450.000', maxlength: '40' });
    var nota = h('textarea', { placeholder: 'Anotações da negociação (ficam cifradas no banco)' });
    nota.value = c.nota || '';
    var msg = h('p', { classe: 'recado', hidden: true });
    corpo.appendChild(h('div', { classe: 'grade-campos' },
      h('label', null, 'Etapa', etapa), h('label', null, 'Responsável', resp), h('label', null, 'Valor fechado', fechado)));
    corpo.appendChild(h('label', null, 'Anotações', nota));
    corpo.appendChild(h('div', { classe: 'linha' },
      h('button', { classe: 'btn', type: 'button', onclick: function () {
        var m = { etapa: etapa.value, nota: nota.value, valor_fechado: fechado.value };
        if (resp.value !== (c.responsavel || '')) m.responsavel = resp.value;
        salvaContato(c, m, function (novo) { c = novo; recado(msg, 'Salvo.', true); });
      } }, 'Salvar'),
      botaoZap(c),
      admin && h('button', { classe: 'btn fantasma pequeno', type: 'button', onclick: function () { exportaContato(c); } }, 'Exportar dados (LGPD)'),
      admin && h('button', { classe: 'btn risco pequeno', type: 'button', onclick: function () {
        if (!confirm('Excluir os dados pessoais de ' + (c.nome || 'este contato') + '? Isso não pode ser desfeito.\n\nUse quando a própria pessoa pedir a exclusão.')) return;
        pedir('contato_excluir', { id: c.id }).then(function (r) {
          if (!r.b.ok) return recado(msg, r.b.mensagem || 'Não consegui excluir.', false);
          d.close(); carregaContatos();
        });
      } }, 'Excluir dados')));
    corpo.appendChild(msg);

    if (c.historico && c.historico.length) {
      corpo.appendChild(h('h2', { texto: 'Histórico' }));
      var ul = h('ul', { classe: 'historico' });
      c.historico.slice().reverse().forEach(function (x) {
        ul.appendChild(h('li', null, h('time', { texto: dataHora(x.quando) }), x.evento + (x.detalhe ? ': ' + x.detalhe : '') + (x.por ? ' — ' + x.por : '')));
      });
      corpo.appendChild(ul);
    }
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function exportaContato(c) {
    pedir('contato_exportar', { id: c.id }, 'GET').then(function (r) {
      if (!r.b.ok) return alert(r.b.mensagem || 'Não consegui exportar.');
      baixa('dados-' + (c.nome || 'contato').replace(/\W+/g, '-').toLowerCase() + '.json',
        JSON.stringify(r.b.contato, null, 2), 'application/json');
    });
  }
  function baixa(nome, conteudo, tipo) {
    var a = h('a', { href: URL.createObjectURL(new Blob([conteudo], { type: tipo })), download: nome });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  $('exportarCsv').addEventListener('click', function () {
    location.href = API + '?acao=contatos_csv&meses=' + encodeURIComponent($('fMeses').value);
  });

  /* ---------------- funil ---------------- */
  function carregaFunil() {
    pedir('resumo', { meses: $('fMeses').value }, 'GET').then(function (r) {
      if (!r.b.ok) return;
      var s = r.b.resumo;
      var nums = limpa($('numeros'));
      [[s.total, 'contatos no período'], [s.fechados, 'fechados'], [s.conversao + '%', 'conversão'],
       [(s.porEtapa.novo || 0), 'ainda sem contato — atender primeiro']].forEach(function (n) {
        nums.appendChild(h('div', null, h('b', { texto: String(n[0]) }), h('span', { texto: n[1] })));
      });
      var g = limpa($('graficos'));
      g.appendChild(barras('Por etapa', s.porEtapa, NOMES_ETAPA, estado.etapas));
      g.appendChild(barras('De onde vieram', s.porOrigem));
      g.appendChild(barras('Por modalidade', s.porModalidade, NOMES_MOD));
      g.appendChild(barras('Página onde pediram', s.porPagina));
    });
  }
  function barras(titulo, obj, nomes, ordem) {
    obj = obj || {};
    var chaves = ordem ? ordem.filter(function (k) { return obj[k]; }) : Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; });
    var max = Math.max.apply(null, chaves.map(function (k) { return obj[k]; }).concat([1]));
    var box = h('div', { classe: 'caixa' }, h('h2', { texto: titulo }));
    var lista = h('div', { classe: 'barras' });
    chaves.slice(0, 12).forEach(function (k) {
      var i = h('i'); i.style.width = Math.round(100 * obj[k] / max) + '%';
      lista.appendChild(h('div', null, h('span', { texto: (nomes && nomes[k]) || k }), h('span', null, i), h('em', { texto: String(obj[k]) })));
    });
    if (!chaves.length) lista.appendChild(h('p', { classe: 'vazio', texto: 'Sem dados ainda.' }));
    box.appendChild(lista);
    return box;
  }

  /* ---------------- agenda ---------------- */
  function carregaAgenda() {
    pedir('agenda', null, 'GET').then(function (r) {
      if (!r.b.ok) return;
      estado.agenda = r.b.config;
      pintaConfig();
      pintaReservas(r.b.reservas || [], r.b.hoje);
    });
  }
  function pintaConfig() {
    var c = estado.agenda, admin = estado.usuario.papel === 'admin';
    $('agDuracao').value = c.duracao; $('agIntervalo').value = c.intervalo;
    $('agAntecedencia').value = c.antecedencia; $('agJanela').value = c.janela; $('agSala').value = c.sala || '';
    var alvo = limpa($('semana'));
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var faixas = (c.semana || {})[String(d)] || [];
      var linha = h('div', { classe: 'dia-linha' }, h('span', { classe: 'dia-nome', texto: SEMANA[d] }));
      faixas.forEach(function (f, i) {
        var ini = h('input', { type: 'time', value: f[0], onchange: function () { f[0] = ini.value; } });
        var fim = h('input', { type: 'time', value: f[1], onchange: function () { f[1] = fim.value; } });
        linha.appendChild(h('span', { classe: 'faixa' }, ini, ' até ', fim, h('button', { type: 'button', title: 'remover', texto: '×',
          onclick: function () { faixas.splice(i, 1); if (!faixas.length) delete c.semana[String(d)]; pintaConfig(); } })));
      });
      linha.appendChild(h('button', { type: 'button', classe: 'mais', texto: faixas.length ? '+ faixa' : '+ atender neste dia',
        onclick: function () { c.semana = c.semana || {}; c.semana[String(d)] = faixas.concat([['09:00', '12:00']]); pintaConfig(); } }));
      alvo.appendChild(linha);
    });
    var bl = limpa($('agBloqueios'));
    (c.bloqueios || []).slice().sort().forEach(function (dia) {
      bl.appendChild(h('span', { classe: 'bloqueio' }, dia.split('-').reverse().join('/'), h('button', { type: 'button', texto: '×',
        onclick: function () { c.bloqueios = c.bloqueios.filter(function (x) { return x !== dia; }); pintaConfig(); } })));
    });
    document.querySelectorAll('#aba-agenda input, #aba-agenda .mais, #aba-agenda .faixa button').forEach(function (el) { el.disabled = !admin; });
  }
  $('agAddBloqueio').addEventListener('click', function () {
    var d = $('agBloqueio').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    estado.agenda.bloqueios = (estado.agenda.bloqueios || []).concat([d]);
    $('agBloqueio').value = ''; pintaConfig();
  });
  $('agSalvar').addEventListener('click', function () {
    var c = estado.agenda;
    c.duracao = +$('agDuracao').value; c.intervalo = +$('agIntervalo').value;
    c.antecedencia = +$('agAntecedencia').value; c.janela = +$('agJanela').value; c.sala = $('agSala').value.trim();
    pedir('agenda_config', { config: c }).then(function (r) {
      if (!r.b.ok) return recado($('agRecado'), r.b.mensagem || 'Não consegui salvar.', false);
      estado.agenda = r.b.config; pintaConfig(); recado($('agRecado'), 'Salvo.', true);
    });
  });
  function pintaReservas(lista, hoje) {
    var corpo = limpa($('agReservas'));
    $('agVazio').hidden = lista.length > 0;
    lista.forEach(function (res) {
      var quando = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        .format(new Date(res.dia + 'T' + res.hora + ':00-03:00'));
      var acao = h('td');
      if (!res.cancelada) acao.appendChild(h('button', { type: 'button', classe: 'btn risco pequeno', texto: 'Desmarcar', onclick: function (e) {
        if (!confirm('Desmarcar a reunião de ' + res.nome + '? Avise a pessoa pelo WhatsApp.')) return;
        e.target.disabled = true;
        pedir('agenda_cancelar', { id: res.id }).then(carregaAgenda);
      } }));
      corpo.appendChild(h('tr', { classe: res.cancelada ? 'cancelada' : (res.dia < hoje ? 'passou' : '') },
        h('td', { classe: 'quando', texto: quando }),
        h('td', null, h('strong', { texto: res.nome || '(excluído)' }), h('small', { texto: formataFone(res.whatsapp) })),
        h('td', { texto: res.assunto || '—' }),
        h('td', null, h('a', { href: res.sala, target: '_blank', rel: 'noopener noreferrer', texto: 'abrir sala' })),
        acao));
    });
  }

  /* ---------------- equipe ---------------- */
  function carregaEquipe() {
    pedir('equipe', null, 'GET').then(function (r) { if (r.b.ok) pintaEquipe(r.b.equipe); });
  }
  function pintaEquipe(lista) {
    var corpo = limpa($('listaEquipe'));
    lista.forEach(function (u) {
      var papel = h('select', { onchange: function () { mudaUsuario(u, { papel: papel.value }); } },
        h('option', { value: 'consultor', selected: u.papel === 'consultor', texto: 'Consultor' }),
        h('option', { value: 'admin', selected: u.papel === 'admin', texto: 'Administrador' }));
      corpo.appendChild(h('tr', { classe: u.ativo ? '' : 'passou' },
        h('td', { texto: u.nome }), h('td', { texto: u.email }), h('td', null, papel),
        h('td', { texto: u.tem2fa ? 'ligada' : '—' }), h('td', { classe: 'quando', texto: dataHora(u.ultimo_acesso) || 'nunca' }),
        h('td', null,
          h('button', { type: 'button', classe: 'btn fantasma pequeno', texto: u.ativo ? 'Desativar' : 'Reativar',
            onclick: function () { mudaUsuario(u, { ativo: !u.ativo }); } }), ' ',
          h('button', { type: 'button', classe: 'btn fantasma pequeno', texto: 'Nova senha', onclick: function () {
            var s = prompt('Senha provisória para ' + u.nome + ' (12+ caracteres). A pessoa terá que trocar no próximo acesso:');
            if (!s) return;
            pedir('equipe_senha', { id: u.id, senha: s }).then(function (r) { alert(r.b.ok ? 'Senha redefinida.' : (r.b.mensagem || 'Não consegui.')); });
          } }))));
    });
  }
  function mudaUsuario(u, m) {
    pedir('equipe_atualizar', Object.assign({ id: u.id }, m)).then(function (r) {
      if (!r.b.ok) { alert(r.b.mensagem || 'Não consegui alterar.'); return carregaEquipe(); }
      pintaEquipe(r.b.equipe);
    });
  }
  $('formEquipe').addEventListener('submit', function (ev) {
    ev.preventDefault();
    pedir('equipe_criar', { nome: $('eqNome').value, email: $('eqEmail').value, papel: $('eqPapel').value, senha: $('eqSenha').value })
      .then(function (r) {
        if (!r.b.ok) return recado($('eqRecado'), r.b.mensagem || 'Não consegui criar.', false);
        recado($('eqRecado'), 'Acesso criado. Passe a senha provisória por um canal diferente do e-mail.', true);
        $('formEquipe').reset(); carregaEquipe();
      });
  });

  /* ---------------- auditoria ---------------- */
  var NOMES_ACAO = { login: 'Entrou', logout: 'Saiu', login_falhou: 'Senha errada', login_bloqueado: 'Tentou entrar com a conta travada',
    '2fa_falhou': 'Código de 2 etapas errado', '2fa_ativado': 'Ligou 2 etapas', '2fa_desativado': 'Desligou 2 etapas',
    senha_trocada: 'Trocou a senha', senha_redefinida: 'Senha redefinida', usuario_criado: 'Criou usuário', usuario_alterado: 'Alterou usuário',
    lead_excluido: 'Excluiu dados de contato', lead_exportado: 'Exportou dados de contato', contatos_exportados: 'Exportou planilha',
    agenda_config: 'Mudou a agenda', reuniao_cancelada: 'Desmarcou reunião', retencao: 'Limpeza automática (prazo de guarda)', instalacao: 'Instalação',
    recuperacao_admin: 'Acesso de administrador recuperado pelo instalador' };
  function carregaAuditoria() {
    pedir('auditoria', null, 'GET').then(function (r) {
      if (!r.b.ok) return;
      var corpo = limpa($('listaAuditoria'));
      r.b.eventos.forEach(function (e) {
        corpo.appendChild(h('tr', null, h('td', { classe: 'quando', texto: dataHora(e.quando) }), h('td', { texto: e.usuario || '—' }),
          h('td', { texto: NOMES_ACAO[e.acao] || e.acao }), h('td', { texto: e.alvo || '' }), h('td', { texto: e.ip })));
      });
    });
  }

  /* ---------------- minha conta ---------------- */
  $('formSenha').addEventListener('submit', function (ev) {
    ev.preventDefault();
    pedir('conta_senha', { atual: $('csAtual').value, nova: $('csNova').value }).then(function (r) {
      if (!r.b.ok) return recado($('csRecado'), r.b.mensagem || 'Não consegui trocar.', false);
      $('formSenha').reset(); recado($('csRecado'), 'Senha trocada.', true);
    });
  });
  function pintaConta() {
    var box = limpa($('caixa2fa'));
    if (estado.usuario.tem2fa) {
      var senha = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'Sua senha' });
      box.appendChild(h('p', null, h('strong', { texto: 'Ligada. ' }), 'Além da senha, o painel pede o código do aplicativo autenticador.'));
      box.appendChild(h('div', { classe: 'linha' }, senha, h('button', { type: 'button', classe: 'btn risco pequeno', texto: 'Desligar',
        onclick: function () {
          pedir('conta_2fa_desativar', { senha: senha.value }).then(function (r) {
            if (!r.b.ok) return alert(r.b.mensagem || 'Não consegui.');
            estado.usuario = r.b.usuario; pintaConta();
          });
        } })));
      return;
    }
    box.appendChild(h('p', null, 'Recomendado para todos que veem dados de clientes: mesmo que alguém descubra a sua senha, não entra sem o código do seu celular.'));
    box.appendChild(h('button', { type: 'button', classe: 'btn', texto: 'Ligar verificação em duas etapas', onclick: function () {
      pedir('conta_2fa_iniciar', {}).then(function (r) {
        if (!r.b.ok) return;
        limpa(box);
        var codigo = h('input', { inputmode: 'numeric', maxlength: '7', placeholder: '123456', autocomplete: 'one-time-code' });
        box.appendChild(h('ol', null,
          h('li', null, 'Abra o Google Authenticator, Microsoft Authenticator ou Authy e escolha "adicionar conta" → "inserir chave".'),
          h('li', null, 'Conta: Astro Consórcios. Chave: ', h('code', { texto: r.b.segredo }), ' (baseada em tempo).'),
          h('li', null, 'No celular, dá também para tocar aqui: ', h('a', { href: r.b.uri, texto: 'abrir no aplicativo' }), '.'),
          h('li', null, 'Digite o código de 6 dígitos que aparecer:')));
        box.appendChild(h('div', { classe: 'linha' }, codigo, h('button', { type: 'button', classe: 'btn', texto: 'Confirmar', onclick: function () {
          pedir('conta_2fa_ativar', { codigo: codigo.value }).then(function (x) {
            if (!x.b.ok) return alert(x.b.mensagem || 'Código incorreto.');
            estado.usuario = x.b.usuario; pintaConta();
          });
        } })));
      });
    } }));
  }

  iniciar();
})();
