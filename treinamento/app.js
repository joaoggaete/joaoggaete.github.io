/* ============================================================================
   TREINO DE VENDAS — lógica do front-end
   Sem IA, sem servidor, sem rede: tudo pré-escrito em dados.js. É uma árvore
   de decisão de 3 momentos por cenário — a escolha muda a reação seguinte
   do cliente e soma pontos que definem o desfecho e a nota final.
   ========================================================================= */
(function () {
  'use strict';

  var CHAVE_ACESSO = 'astro-treino-acesso';
  var CHAVE_PROGRESSO = 'astro-treino-progresso';
  var CODIGO_CERTO = '180498';
  var PONTOS_POR_TURNO_IDEAL = 3;

  var estado = {
    produtoAtivo: 'todos',
    busca: '',
    cenarioId: null,
    modo: null,         /* 'pratica' | 'consulta' */
    turno: 0,          /* índice do turno atual (0, 1, 2) */
    soma: 0,
    escolhas: [],       /* [{qualidade, feedback}] */
    ultimaQualidade: null,
    travado: false
  };

  /* --------------------------- busca (sem acento, sem caixa) --------------------------- */
  function normalizar(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  /* palavras conectoras curtas (já sem acento) que, sozinhas, batem em quase
     qualquer texto e não ajudam a achar a objeção certa — "à vista" sem isso
     viraria só "vista", que também aparece em "pontos de vista" etc. */
  var PALAVRAS_IGNORADAS = ['a', 'o', 'e', 'de', 'do', 'da', 'em', 'no', 'na', 'se', 'os',
    'as', 'ao', 'um', 'uma', 'que', 'com', 'pra', 'para', 'por', 'ou', 'eu', 'e'];

  function cenarioCombinaComBusca(c, termo) {
    if (!termo) return true;
    var palavras = termo.split(/\s+/).filter(function (p) {
      return p.length > 2 && PALAVRAS_IGNORADAS.indexOf(p) === -1;
    });
    if (!palavras.length) return true;
    var alvo = [c.titulo, c.resumo, c.objetivo, window.PRODUTOS_TREINO[c.produto].nome, window.ETAPAS_TREINO[c.etapa]];
    c.turnos.forEach(function (t) {
      alvo.push(t.clienteAbertura, t.clienteSeFracoAntes);
      t.opcoes.forEach(function (op) { alvo.push(op.texto, op.feedback); });
    });
    var textao = normalizar(alvo.join(' | '));
    return palavras.every(function (palavra) { return textao.indexOf(palavra) !== -1; });
  }

  /* --------------------------- tema --------------------------- */
  function alternarTema() {
    var atual = document.documentElement.getAttribute('data-tema');
    var novo = atual === 'claro' ? 'escuro' : 'claro';
    document.documentElement.setAttribute('data-tema', novo);
    document.documentElement.classList.toggle('t-claro', novo === 'claro');
    document.documentElement.style.colorScheme = novo === 'claro' ? 'light' : 'dark';
    try { localStorage.setItem('astro-tema', novo); } catch (e) {}
  }

  /* --------------------------- acesso (só local, sem servidor) --------------------------- */
  function mostrarPortal(mensagemErro) {
    document.getElementById('portalAcesso').hidden = false;
    document.getElementById('erroAcesso').textContent = mensagemErro || '';
    var campo = document.getElementById('campoCodigo');
    campo.value = '';
    campo.focus();
  }
  function esconderPortal() { document.getElementById('portalAcesso').hidden = true; }
  function jaTemAcesso() {
    try { return localStorage.getItem(CHAVE_ACESSO) === CODIGO_CERTO; } catch (e) { return false; }
  }
  function tentarEntrar() {
    var v = document.getElementById('campoCodigo').value.trim();
    if (v === CODIGO_CERTO) {
      try { localStorage.setItem(CHAVE_ACESSO, v); } catch (e) {}
      esconderPortal();
    } else {
      mostrarPortal('Código incorreto. Tente de novo.');
    }
  }

  /* --------------------------- progresso (localStorage) --------------------------- */
  function lerProgresso() {
    try { return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO) || '{}'); } catch (e) { return {}; }
  }
  function salvarProgresso(p) {
    try { localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p)); } catch (e) {}
  }
  function registrarTentativa(cenarioId, nota) {
    var p = lerProgresso();
    var atual = p[cenarioId] || { tentativas: 0, melhorNota: null, ultimaNota: null };
    atual.tentativas += 1;
    atual.ultimaNota = nota;
    if (atual.melhorNota === null || nota > atual.melhorNota) atual.melhorNota = nota;
    p[cenarioId] = atual;
    salvarProgresso(p);
  }

  /* --------------------------- lista de cenários --------------------------- */
  var SELOS_DIFICULDADE = { facil: 'fácil', medio: 'médio', dificil: 'difícil' };

  function renderAbas() {
    var caixa = document.getElementById('abasProduto');
    caixa.innerHTML = '';
    var produtos = [{ id: 'todos', nome: 'Todos', emoji: '📋' }];
    Object.keys(window.PRODUTOS_TREINO).forEach(function (id) {
      produtos.push({ id: id, nome: window.PRODUTOS_TREINO[id].nome, emoji: window.PRODUTOS_TREINO[id].emoji });
    });
    produtos.forEach(function (p) {
      var b = document.createElement('button');
      b.className = 'aba' + (estado.produtoAtivo === p.id ? ' ativa' : '');
      b.textContent = p.emoji + ' ' + p.nome;
      b.onclick = function () { estado.produtoAtivo = p.id; renderAbas(); renderListaCenarios(); };
      caixa.appendChild(b);
    });
  }

  function renderListaCenarios() {
    var caixa = document.getElementById('listaCenarios');
    caixa.innerHTML = '';
    var progresso = lerProgresso();
    var termoBusca = normalizar(estado.busca.trim());
    var cenarios = window.CENARIOS_TREINO.filter(function (c) {
      return (estado.produtoAtivo === 'todos' || c.produto === estado.produtoAtivo) &&
        cenarioCombinaComBusca(c, termoBusca);
    });
    if (!cenarios.length) {
      caixa.innerHTML = '<div class="vazio-busca">Nenhum cenário encontrado pra essa busca.</div>';
      return;
    }
    cenarios.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'cartao-cenario' + (estado.cenarioId === c.id ? ' selecionado' : '');
      var infoProgresso = progresso[c.id];
      var linhaProgresso = infoProgresso
        ? ('melhor nota: ' + infoProgresso.melhorNota.toFixed(1) + ' · ' + infoProgresso.tentativas + 'x praticado')
        : '';
      var corpo = document.createElement('button');
      corpo.className = 'cartao-corpo';
      corpo.innerHTML =
        '<div class="cartao-topo"><span class="cartao-titulo">' + escapar(c.titulo) + '</span></div>' +
        '<div class="selos">' +
          '<span class="selo">' + window.PRODUTOS_TREINO[c.produto].emoji + ' ' + window.PRODUTOS_TREINO[c.produto].nome + '</span>' +
          '<span class="selo">' + window.ETAPAS_TREINO[c.etapa] + '</span>' +
          '<span class="selo dif-' + c.dificuldade + '">' + SELOS_DIFICULDADE[c.dificuldade] + '</span>' +
        '</div>' +
        '<div class="cartao-resumo">' + escapar(c.resumo) + '</div>' +
        (linhaProgresso ? '<div class="progresso-mini">' + linhaProgresso + '</div>' : '');
      corpo.onclick = function () { iniciarCenario(c.id); };
      var verScript = document.createElement('button');
      verScript.className = 'cartao-ver-script';
      verScript.textContent = '📄 Ver resposta pronta';
      verScript.onclick = function () { mostrarRoteiro(c.id); };
      card.appendChild(corpo);
      card.appendChild(verScript);
      caixa.appendChild(card);
    });
  }

  function escapar(s) {
    var d = document.createElement('div');
    d.textContent = String(s || '');
    return d.innerHTML;
  }

  /* --------------------------- sessão --------------------------- */
  function buscarCenario(id) {
    for (var i = 0; i < window.CENARIOS_TREINO.length; i++) {
      if (window.CENARIOS_TREINO[i].id === id) return window.CENARIOS_TREINO[i];
    }
    return null;
  }

  function iniciarCenario(id) {
    estado.cenarioId = id;
    estado.modo = 'pratica';
    estado.turno = 0;
    estado.soma = 0;
    estado.escolhas = [];
    estado.ultimaQualidade = null;
    estado.travado = false;
    document.getElementById('avisoConsulta').hidden = true;
    renderListaCenarios();
    renderCabecalhoChat();
    renderFicha();
    limparAvaliacao();
    document.getElementById('btnReiniciar').disabled = false;
    montarTurnoAtual(true);
  }

  function mostrarRoteiro(id) {
    estado.cenarioId = id;
    estado.modo = 'consulta';
    estado.travado = true;
    var c = buscarCenario(id);
    renderListaCenarios();
    renderCabecalhoChat();
    renderFicha();
    limparAvaliacao();
    limparMensagens();
    document.getElementById('opcoesResposta').innerHTML = '';
    document.getElementById('btnReiniciar').disabled = true;
    document.getElementById('avisoConsulta').hidden = false;

    c.turnos.forEach(function (t) {
      bolha(t.clienteAbertura, 'cliente');
      var ideal = t.opcoes.filter(function (op) { return op.qualidade === 'ideal'; })[0];
      var el = bolha(ideal.texto, 'vendedor roteiro');
      el.insertAdjacentHTML('afterbegin', '<span class="roteiro-selo">✅ resposta recomendada</span>');
    });
    bolha(c.desfechos.otimo, 'cliente');
  }

  function renderCabecalhoChat() {
    var c = buscarCenario(estado.cenarioId);
    var caixa = document.getElementById('chatCabecalho');
    if (!c) {
      caixa.innerHTML = '<div><div class="quem">Escolha um cenário ao lado</div><div class="onde">A conversa aparece aqui</div></div>';
      return;
    }
    caixa.innerHTML =
      '<div><div class="quem">' + escapar(c.titulo) + '</div>' +
      '<div class="onde">' + window.PRODUTOS_TREINO[c.produto].nome + ' · ' + window.ETAPAS_TREINO[c.etapa] + '</div></div>';
  }

  function renderFicha() {
    var c = buscarCenario(estado.cenarioId);
    var caixa = document.getElementById('fichaObjetivo');
    if (!c) {
      caixa.innerHTML = '<h2 class="rotulo">Ficha do cenário</h2><div class="vazio-ficha">Nenhum cenário selecionado ainda.</div>';
      return;
    }
    caixa.innerHTML =
      '<h2 class="rotulo">Ficha do cenário</h2>' +
      '<div class="selos">' +
        '<span class="selo">' + window.PRODUTOS_TREINO[c.produto].emoji + ' ' + window.PRODUTOS_TREINO[c.produto].nome + '</span>' +
        '<span class="selo">' + window.ETAPAS_TREINO[c.etapa] + '</span>' +
        '<span class="selo dif-' + c.dificuldade + '">' + SELOS_DIFICULDADE[c.dificuldade] + '</span>' +
      '</div>' +
      '<div class="ficha-objetivo"><strong>Contexto:</strong> ' + escapar(c.resumo) + '</div>' +
      '<div class="ficha-objetivo" style="margin-top:8px"><strong>Seu objetivo:</strong> ' + escapar(c.objetivo) + '</div>' +
      (estado.modo === 'pratica'
        ? '<div class="ficha-objetivo" style="margin-top:8px;color:var(--text-3)">Passo ' + Math.min(estado.turno + 1, 3) + ' de 3</div>'
        : '');
  }

  var caixaMensagens;
  function limparMensagens() {
    caixaMensagens = document.getElementById('mensagens');
    caixaMensagens.innerHTML = '';
  }

  function bolha(texto, classe) {
    var el = document.createElement('div');
    el.className = 'bolha ' + classe;
    el.textContent = texto;
    caixaMensagens.appendChild(el);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;
    return el;
  }

  function montarTurnoAtual(primeiraVez) {
    var c = buscarCenario(estado.cenarioId);
    if (primeiraVez) limparMensagens();
    var turno = c.turnos[estado.turno];
    var textoCliente = (estado.ultimaQualidade === 'fraca' && turno.clienteSeFracoAntes)
      ? turno.clienteSeFracoAntes
      : turno.clienteAbertura;
    bolha(textoCliente, 'cliente');
    renderOpcoes(turno.opcoes);
    renderFicha();
  }

  function renderOpcoes(opcoes) {
    var caixa = document.getElementById('opcoesResposta');
    caixa.innerHTML = '';
    estado.travado = false;
    opcoes.forEach(function (op, i) {
      var b = document.createElement('button');
      b.className = 'opcao-resposta';
      b.innerHTML = '<span class="opcao-letra">' + String.fromCharCode(65 + i) + '</span><span>' + escapar(op.texto) + '</span>';
      b.onclick = function () { escolherOpcao(op); };
      caixa.appendChild(b);
    });
  }

  function escolherOpcao(op) {
    if (estado.travado) return;
    estado.travado = true;
    document.getElementById('opcoesResposta').innerHTML = '';

    bolha(op.texto, 'vendedor');
    var tag = document.createElement('div');
    tag.className = 'feedback-inline feedback-' + op.qualidade;
    var rotulo = op.qualidade === 'ideal' ? '✅ ótima escolha' : op.qualidade === 'ok' ? '🟡 dava pra melhorar' : '🔴 resposta arriscada';
    tag.innerHTML = '<strong>' + rotulo + '</strong> — ' + escapar(op.feedback);
    caixaMensagens.appendChild(tag);
    caixaMensagens.scrollTop = caixaMensagens.scrollHeight;

    estado.soma += op.pontos;
    estado.escolhas.push({ qualidade: op.qualidade, feedback: op.feedback });
    estado.ultimaQualidade = op.qualidade;

    setTimeout(function () {
      estado.turno += 1;
      var c = buscarCenario(estado.cenarioId);
      if (estado.turno < c.turnos.length) {
        montarTurnoAtual(false);
      } else {
        encerrarCenario();
      }
    }, 650);
  }

  function reiniciarCenario() {
    if (!estado.cenarioId) return;
    iniciarCenario(estado.cenarioId);
  }

  function limparAvaliacao() {
    document.getElementById('painelAvaliacao').innerHTML = '';
  }

  function encerrarCenario() {
    var c = buscarCenario(estado.cenarioId);
    var maximo = c.turnos.length * PONTOS_POR_TURNO_IDEAL;
    var minimo = -1 * c.turnos.length;
    var nota = Math.max(0, Math.min(10, ((estado.soma - minimo) / (maximo - minimo)) * 10));

    var tier = nota >= 7.5 ? 'otimo' : nota >= 4.5 ? 'ok' : 'fraco';
    bolha(c.desfechos[tier], 'cliente');

    registrarTentativa(estado.cenarioId, nota);
    renderListaCenarios();
    renderAvaliacao(nota, estado.escolhas);
  }

  function renderAvaliacao(nota, escolhas) {
    var fortes = escolhas.filter(function (e) { return e.qualidade === 'ideal'; }).map(function (e) { return e.feedback; });
    var melhorar = escolhas.filter(function (e) { return e.qualidade !== 'ideal'; }).map(function (e) { return e.feedback; });

    var html = '<h2 class="rotulo">Avaliação</h2><div class="avaliacao">' +
      '<div class="nota">' + nota.toFixed(1) + '<span> / 10</span></div>';
    if (fortes.length) {
      html += '<div style="margin-top:10px"><strong style="font-size:12.5px;color:var(--verde)">PONTOS FORTES</strong><ul>' +
        fortes.map(function (p) { return '<li>' + escapar(p) + '</li>'; }).join('') + '</ul></div>';
    }
    if (melhorar.length) {
      html += '<div><strong style="font-size:12.5px;color:var(--amarelo)">A MELHORAR</strong><ul>' +
        melhorar.map(function (p) { return '<li>' + escapar(p) + '</li>'; }).join('') + '</ul></div>';
    }
    html += '</div>';
    document.getElementById('painelAvaliacao').innerHTML = html;
  }

  /* --------------------------- inicialização --------------------------- */
  function iniciar() {
    document.getElementById('btnTema').onclick = alternarTema;
    document.getElementById('btnTrocarCodigo').onclick = function () { mostrarPortal(''); };
    document.getElementById('btnEntrar').onclick = tentarEntrar;
    document.getElementById('campoCodigo').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tentarEntrar();
    });
    document.getElementById('btnReiniciar').onclick = reiniciarCenario;
    document.getElementById('btnPraticarAgora').onclick = function () { iniciarCenario(estado.cenarioId); };
    document.getElementById('buscaCenarios').addEventListener('input', function (e) {
      estado.busca = e.target.value;
      renderListaCenarios();
    });

    if (!jaTemAcesso()) mostrarPortal(''); else esconderPortal();

    renderAbas();
    renderListaCenarios();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
