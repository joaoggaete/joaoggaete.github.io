/* ============================================================================
   TREINO DE VENDAS — lógica do front-end
   Sem framework, sem build: só DOM puro, igual ao resto do site. Fala com
   netlify/functions/treino.js para o role-play e a avaliação.
   ========================================================================= */
(function () {
  'use strict';

  var CHAVE_TOKEN = 'astro-treino-token';
  var CHAVE_PROGRESSO = 'astro-treino-progresso';
  var URL_FUNCAO = '/.netlify/functions/treino';

  var estado = {
    produtoAtivo: 'todos',
    cenarioId: null,
    historico: [],       /* [{de:'vendedor'|'cliente', texto}] */
    enviando: false
  };

  /* --------------------------- tema --------------------------- */
  function alternarTema() {
    var atual = document.documentElement.getAttribute('data-tema');
    var novo = atual === 'claro' ? 'escuro' : 'claro';
    document.documentElement.setAttribute('data-tema', novo);
    document.documentElement.classList.toggle('t-claro', novo === 'claro');
    document.documentElement.style.colorScheme = novo === 'claro' ? 'light' : 'dark';
    try { localStorage.setItem('astro-tema', novo); } catch (e) {}
  }

  /* --------------------------- acesso --------------------------- */
  function pegarToken() {
    try { return localStorage.getItem(CHAVE_TOKEN) || ''; } catch (e) { return ''; }
  }
  function salvarToken(t) {
    try { localStorage.setItem(CHAVE_TOKEN, t); } catch (e) {}
  }
  function mostrarPortal(mensagemErro) {
    document.getElementById('portalAcesso').hidden = false;
    document.getElementById('erroAcesso').textContent = mensagemErro || '';
    var campo = document.getElementById('campoCodigo');
    campo.value = '';
    campo.focus();
  }
  function esconderPortal() {
    document.getElementById('portalAcesso').hidden = true;
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

  /* --------------------------- chamada à função --------------------------- */
  function chamarTreino(corpo) {
    return fetch(URL_FUNCAO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Treino-Token': pegarToken() },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      if (r.status === 401) { mostrarPortal('Código incorreto. Tente de novo.'); throw new Error('401'); }
      return r.json();
    });
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
    var cenarios = window.CENARIOS_TREINO.filter(function (c) {
      return estado.produtoAtivo === 'todos' || c.produto === estado.produtoAtivo;
    });
    cenarios.forEach(function (c) {
      var card = document.createElement('button');
      card.className = 'cartao-cenario' + (estado.cenarioId === c.id ? ' selecionado' : '');
      var infoProgresso = progresso[c.id];
      var linhaProgresso = infoProgresso
        ? ('melhor nota: ' + infoProgresso.melhorNota.toFixed(1) + ' · ' + infoProgresso.tentativas + 'x praticado')
        : '';
      card.innerHTML =
        '<div class="cartao-topo"><span class="cartao-titulo">' + escapar(c.titulo) + '</span></div>' +
        '<div class="selos">' +
          '<span class="selo">' + window.PRODUTOS_TREINO[c.produto].emoji + ' ' + window.PRODUTOS_TREINO[c.produto].nome + '</span>' +
          '<span class="selo">' + window.ETAPAS_TREINO[c.etapa] + '</span>' +
          '<span class="selo dif-' + c.dificuldade + '">' + SELOS_DIFICULDADE[c.dificuldade] + '</span>' +
        '</div>' +
        '<div class="cartao-resumo">' + escapar(c.resumo) + '</div>' +
        (linhaProgresso ? '<div class="progresso-mini">' + linhaProgresso + '</div>' : '');
      card.onclick = function () { iniciarCenario(c.id); };
      caixa.appendChild(card);
    });
  }

  function escapar(s) {
    var d = document.createElement('div');
    d.textContent = String(s || '');
    return d.innerHTML;
  }

  /* --------------------------- sessão de chat --------------------------- */
  function buscarCenario(id) {
    for (var i = 0; i < window.CENARIOS_TREINO.length; i++) {
      if (window.CENARIOS_TREINO[i].id === id) return window.CENARIOS_TREINO[i];
    }
    return null;
  }

  function iniciarCenario(id) {
    estado.cenarioId = id;
    estado.historico = [];
    estado.enviando = false;
    renderListaCenarios();
    renderCabecalhoChat();
    renderFicha();
    renderMensagens();
    limparAvaliacao();
    document.getElementById('campoMensagem').disabled = false;
    document.getElementById('btnEnviar').disabled = false;
    document.getElementById('btnDica').disabled = false;
    document.getElementById('btnReiniciar').disabled = false;
    document.getElementById('btnEncerrar').disabled = false;
    document.getElementById('campoMensagem').focus();
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
      '<div class="ficha-objetivo" style="margin-top:8px"><strong>Seu objetivo:</strong> ' + escapar(c.objetivo) + '</div>';
  }

  function renderMensagens() {
    var caixa = document.getElementById('mensagens');
    if (estado.historico.length === 0) {
      caixa.innerHTML = '<div class="vazio-chat">Mande a primeira mensagem como se estivesse abordando o cliente pelo WhatsApp.</div>';
      return;
    }
    caixa.innerHTML = '';
    estado.historico.forEach(function (m) {
      var bolha = document.createElement('div');
      bolha.className = 'bolha ' + (m.de === 'cliente' ? 'cliente' : 'vendedor');
      bolha.textContent = m.texto;
      caixa.appendChild(bolha);
    });
    caixa.scrollTop = caixa.scrollHeight;
  }

  function mostrarDigitando(mostrar) {
    var caixa = document.getElementById('mensagens');
    var existente = document.getElementById('bolhaDigitando');
    if (mostrar && !existente) {
      var bolha = document.createElement('div');
      bolha.id = 'bolhaDigitando';
      bolha.className = 'bolha cliente digitando';
      bolha.textContent = 'digitando…';
      caixa.appendChild(bolha);
      caixa.scrollTop = caixa.scrollHeight;
    } else if (!mostrar && existente) {
      existente.remove();
    }
  }

  function definirTravado(travado) {
    estado.enviando = travado;
    document.getElementById('btnEnviar').disabled = travado;
    document.getElementById('btnDica').disabled = travado;
    document.getElementById('btnEncerrar').disabled = travado;
    document.getElementById('campoMensagem').disabled = travado;
  }

  function enviarMensagem() {
    if (estado.enviando || !estado.cenarioId) return;
    var campo = document.getElementById('campoMensagem');
    var texto = campo.value.trim();
    if (!texto) return;
    estado.historico.push({ de: 'vendedor', texto: texto });
    renderMensagens();
    campo.value = '';
    definirTravado(true);
    mostrarDigitando(true);

    chamarTreino({ cenarioId: estado.cenarioId, historico: estado.historico.slice(0, -1), mensagem: texto, acao: 'responder' })
      .then(function (r) {
        mostrarDigitando(false);
        if (r.erro === 'sem_chave') {
          estado.historico.push({ de: 'cliente', texto: '(' + r.mensagem + ')' });
        } else {
          estado.historico.push({ de: 'cliente', texto: r.resposta || '(sem resposta)' });
        }
        renderMensagens();
      })
      .catch(function () {
        mostrarDigitando(false);
        estado.historico.push({ de: 'cliente', texto: '(erro de conexão, tente enviar de novo)' });
        renderMensagens();
      })
      .then(function () { definirTravado(false); campo.focus(); });
  }

  function pedirDica() {
    if (estado.enviando || !estado.cenarioId) return;
    definirTravado(true);
    var caixaDica = document.getElementById('dicaFlutuante');
    caixaDica.hidden = false;
    caixaDica.textContent = '💡 pensando numa dica…';
    chamarTreino({ cenarioId: estado.cenarioId, historico: estado.historico, acao: 'dica' })
      .then(function (r) { caixaDica.textContent = '💡 ' + (r.dica || 'sem dica agora'); })
      .catch(function () { caixaDica.textContent = '💡 não consegui pensar numa dica agora'; })
      .then(function () { definirTravado(false); });
  }

  function reiniciarCenario() {
    if (!estado.cenarioId) return;
    estado.historico = [];
    renderMensagens();
    limparAvaliacao();
    document.getElementById('dicaFlutuante').hidden = true;
  }

  function limparAvaliacao() {
    document.getElementById('painelAvaliacao').innerHTML = '';
  }

  function encerrarEAvaliar() {
    if (estado.enviando || !estado.cenarioId) return;
    if (estado.historico.length < 2) {
      document.getElementById('painelAvaliacao').innerHTML =
        '<div class="vazio-ficha">Troque algumas mensagens antes de pedir a avaliação.</div>';
      return;
    }
    definirTravado(true);
    document.getElementById('painelAvaliacao').innerHTML = '<div class="vazio-ficha">Avaliando a conversa…</div>';
    chamarTreino({ cenarioId: estado.cenarioId, historico: estado.historico, acao: 'feedback' })
      .then(function (r) {
        if (r.avaliacao) {
          renderAvaliacao(r.avaliacao);
          registrarTentativa(estado.cenarioId, Number(r.avaliacao.nota) || 0);
          renderListaCenarios();
        } else {
          document.getElementById('painelAvaliacao').innerHTML =
            '<div class="vazio-ficha">' + escapar(r.mensagem || 'Não consegui avaliar agora.') + '</div>';
        }
      })
      .catch(function () {
        document.getElementById('painelAvaliacao').innerHTML = '<div class="vazio-ficha">Erro de conexão ao avaliar.</div>';
      })
      .then(function () { definirTravado(false); });
  }

  function renderAvaliacao(a) {
    var nota = Number(a.nota) || 0;
    var html = '<h2 class="rotulo">Avaliação do coach</h2><div class="avaliacao">' +
      '<div class="nota">' + nota.toFixed(1) + '<span> / 10</span></div>';
    if (Array.isArray(a.pontosFortes) && a.pontosFortes.length) {
      html += '<div style="margin-top:10px"><strong style="font-size:12.5px;color:var(--verde)">PONTOS FORTES</strong><ul>' +
        a.pontosFortes.map(function (p) { return '<li>' + escapar(p) + '</li>'; }).join('') + '</ul></div>';
    }
    if (Array.isArray(a.pontosAMelhorar) && a.pontosAMelhorar.length) {
      html += '<div><strong style="font-size:12.5px;color:var(--amarelo)">A MELHORAR</strong><ul>' +
        a.pontosAMelhorar.map(function (p) { return '<li>' + escapar(p) + '</li>'; }).join('') + '</ul></div>';
    }
    if (a.fraseSugerida) {
      html += '<div class="frase-sugerida">"' + escapar(a.fraseSugerida) + '"</div>';
    }
    if (a.resumo) {
      html += '<div class="resumo">' + escapar(a.resumo) + '</div>';
    }
    html += '</div>';
    document.getElementById('painelAvaliacao').innerHTML = html;
  }

  /* --------------------------- inicialização --------------------------- */
  function iniciar() {
    document.getElementById('btnTema').onclick = alternarTema;
    document.getElementById('btnTrocarCodigo').onclick = function () { mostrarPortal(''); };
    document.getElementById('btnEntrar').onclick = function () {
      var v = document.getElementById('campoCodigo').value.trim();
      salvarToken(v);
      esconderPortal();
    };
    document.getElementById('campoCodigo').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('btnEntrar').click();
    });
    document.getElementById('btnEnviar').onclick = enviarMensagem;
    document.getElementById('campoMensagem').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
    });
    document.getElementById('btnDica').onclick = pedirDica;
    document.getElementById('btnReiniciar').onclick = reiniciarCenario;
    document.getElementById('btnEncerrar').onclick = encerrarEAvaliar;

    if (!pegarToken()) mostrarPortal(''); else esconderPortal();

    renderAbas();
    renderListaCenarios();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
