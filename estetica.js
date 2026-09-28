/* ==========================================================================
   ESTETICA.JS — GERADO por ferramentas/estetica.js a partir do index.html.
   Não edite aqui: a próxima rodada de "node ferramentas/layout.js" apaga.
   A Fita (o vídeo do fundo), a Régua e a Calculadora são o MESMO código da
   página inicial; só a moldura em volta é destas páginas.
   Precisa de /taxas.js antes (só nas páginas com simulador).
   ========================================================================== */
(function(){
  'use strict';

  var mqMr = matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function(v,lo,hi){ return Math.min(hi, Math.max(lo, v)); };
  var brl = function(v){ return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };
  /* a medição é do site.js (window.rastrear, que respeita o consentimento);
     "calado" silencia a troca de modalidade que a própria página faz ao abrir */
  var calado = false;
  function rastrear(evento, dados){
    if (calado) return;
    try { if (typeof window.rastrear === 'function') window.rastrear(evento, dados); } catch(e){}
  }

  var Fita = (function(){
    var v = document.getElementById('fluxo');
    if (!v || typeof v.play !== 'function') return { tema:function(){} };

    var mqMenos = window.matchMedia('(prefers-reduced-motion: reduce)');
    var carregada = '';

    function retrato(){ return window.innerHeight >= window.innerWidth; }
    /* Quatro arquivos: dois formatos vezes dois temas. Desde a 2ª geração
       (offline, com o céu e a mistura de cor já dentro do vídeo) o nome leva
       "-v2": os quatro anteriores ficam no ar sob o nome antigo por causa do
       cache imutável do Netlify (ver netlify.toml), e um nome novo é a única
       forma de forçar o navegador a buscar o conteúdo novo. */
    function arquivo(){
      return 'video/fluxo-' + (claroAgora() ? 'claro' : 'escuro') +
             (retrato() ? '-alto' : '-largo') + '-v2';
    }

    function poupando(){
      var c = navigator.connection;
      if (!c) return false;
      if (c.saveData) return true;
      return /(^|-)2g$/.test(c.effectiveType || '');
    }
    function claroAgora(){
      var t = document.documentElement.getAttribute('data-tema');
      if (t === 'claro') return true;
      if (t === 'escuro') return false;
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    function ligar(){
      /* o tema claro deixou de ser motivo para não tocar: agora ele tem a
         fita dele. Só quem pediu menos movimento continua de fora. */
      if (mqMenos.matches) return;
      var base = arquivo();
      /* o poster entra sempre, mesmo quando o vídeo não vai tocar: sem ele o
         fundo fica um retângulo vazio no lugar da fita.
         CAPA EM RESOLUÇÃO CHEIA ("-capa.webp"): a anterior (".webp") tinha
         480 px de largura, esticada para a tela inteira — era ela que o
         visitante via até o vídeo começar, e para sempre em quem pediu menos
         movimento, está economizando dados ou com o iPhone em modo de pouca
         energia (o autoplay não roda). É o 1º quadro do próprio vídeo, em
         1920 px, e pesa 13 a 25 KB porque a cena é quase toda escura. */
      v.setAttribute('poster', base + '-capa.webp');
      if (poupando()) return;
      if (carregada === base) { tocar(); return; }
      carregada = base;
      v.setAttribute('src', base + '.mp4');
      v.load();
      tocar();
    }
    function tocar(){
      var p = v.play();
      /* navegador pode recusar mesmo mudo, e recusa devolve promessa
         rejeitada. Sem este catch vira erro não tratado no console. */
      if (p && p.catch) p.catch(function(){});
    }

    /* trocar de arquivo em cada resize baixaria o vídeo de novo à toa; só
       vale quando a orientação realmente virou */
    var eraRetrato = retrato(), tmr = null;
    window.addEventListener('resize', function(){
      clearTimeout(tmr);
      tmr = setTimeout(function(){
        if (retrato() === eraRetrato) return;
        eraRetrato = retrato();
        ligar();
      }, 400);
    }, { passive:true });

    document.addEventListener('visibilitychange', function(){
      if (document.hidden) v.pause(); else ligar();
    });
    if (mqMenos.addEventListener) mqMenos.addEventListener('change', function(){
      if (mqMenos.matches) v.pause(); else ligar();
    });

    /* a fita é decoração: entra depois que o conteúdo já está de pé, para não
       disputar banda com o que a pessoa veio ler */
    if (document.readyState === 'complete') ligar();
    else window.addEventListener('load', ligar);

    /* trocar de tema troca de ARQUIVO, não só de estilo — o ligar() já
       compara com o que está carregado e só baixa se mudou */
    return { tema:function(){ ligar(); } };
  })();

  /* o tema muda pelo menu (nav.js): a fita troca de arquivo junto */
  try {
    new MutationObserver(function(){ Fita.tema(); })
      .observe(document.documentElement, { attributes:true, attributeFilter:['data-tema'] });
    var mqClaro = matchMedia('(prefers-color-scheme: light)');
    if (mqClaro.addEventListener) mqClaro.addEventListener('change', function(){ Fita.tema(); });
  } catch(e){}

  /* ------------------------------------------------------------------------
     SIMULADOR — só nas páginas que têm a seção #calculadora
     ------------------------------------------------------------------------ */
  if (!window.AstroTaxas || !document.getElementById('calcValor')) return;
  var secao = document.getElementById('calculadora');
  var modoInicial = secao ? secao.getAttribute('data-modo-inicial') : '';
  var q = new URLSearchParams(location.search).get('modalidade');
  if (q && window.AstroTaxas.perfis[q]) modoInicial = q;
  var progAtual = 1;

  var Regua = (function(){
    /* X0 quase colado na borda: a régua alinha com o título em vez de flutuar recuada.
       Duas geometrias: larga e deitada no desktop, alta e respirada no celular. */
    var GEO = {
      /* faixa deitada: a régua apoia a ideia do tempo, não domina o hero */
      largo:    { vb:'0 0 1000 115', X0:4, X1:996, Y0:97, YTOP:10, lbl:12, cab1:4,  cab2:100, gy:7 },
      estreito: { vb:'0 0 460 260',  X0:4, X1:456, Y0:216, YTOP:20, lbl:26, cab1:8,  cab2:224, gy:12 }
    };
    var X0 = 4, X1 = 996, Y0 = 248, YTOP = 26, LBL = 24, CAB1 = 12, CAB2 = 256, GY = 18;
    /* a régua lia 18% e nada mais, e escrevia no MESMO elemento da diferença
       que o simulador: a tela mostrava dois totais para o mesmo consórcio. */
    /* lidos a cada remedição: a modalidade muda o prazo */
    var N = window.AstroTaxas.def().N, I = window.AstroTaxas.def().I, ADM = window.AstroTaxas.def().ADM;

    var el = {
      svg:    document.getElementById('reguaSvg'),
      grade:  document.getElementById('reguaGrade'),
      wedge:  document.getElementById('reguaWedge'),
      lFin:   document.getElementById('reguaLinhaFin'),
      lCon:   document.getElementById('reguaLinhaCon'),
      cabeca: document.getElementById('reguaCabeca'),
      hFin:   document.getElementById('reguaHaloFin'),
      hCon:   document.getElementById('reguaHaloCon'),
      pFin:   document.getElementById('reguaPontoFin'),
      pCon:   document.getElementById('reguaPontoCon'),
      gFin:   document.getElementById('reguaGhostFin'),
      gCon:   document.getElementById('reguaGhostCon'),
      gWedge: document.getElementById('reguaGhostWedge'),
      cunha:  document.getElementById('reguaCunhaTxt'),
      mes:    document.getElementById('reguaMes'),
      vFin:   document.getElementById('reguaFin'),
      vCon:   document.getElementById('reguaCon'),
      econ:   document.querySelector('[data-eco]')
    };
    if (!el.svg) return { set:function(){}, desenharGrade:function(){}, pv:function(){}, fim:function(){}, remedir:function(){} };

    var PV = 300000, totFin = 0, totCon = 0, yConFim = 0;

    function medirGeo(){
      /* a modalidade pode ter mudado desde a última medição */
      N = window.AstroTaxas.def().N; I = window.AstroTaxas.def().I; ADM = window.AstroTaxas.def().ADM;
      var g = window.innerWidth <= 720 ? GEO.estreito : GEO.largo;
      X0 = g.X0; X1 = g.X1; Y0 = g.Y0; YTOP = g.YTOP; LBL = g.lbl; CAB1 = g.cab1; CAB2 = g.cab2; GY = g.gy;
      el.svg.setAttribute('viewBox', g.vb);
      el.cabeca.setAttribute('y1', CAB1); el.cabeca.setAttribute('y2', CAB2);
      [el.gFin, el.gCon, el.lFin, el.lCon].forEach(function(l){
        l.setAttribute('x1', X0); l.setAttribute('y1', Y0);
      });
      el.gFin.setAttribute('x2', X1); el.gFin.setAttribute('y2', YTOP);
      el.gCon.setAttribute('x2', X1);
    }

    function recalcular(){
      /* mesma conta do simulador, com fundo de reserva e seguros dos dois lados */
      var c = window.AstroTaxas.compor(PV);
      totFin = c.fin.total;
      totCon = c.con.total;
      yConFim = Y0 - (totCon / totFin) * (Y0 - YTOP);
      /* o fantasma mostra as duas rotas inteiras, e reage ao valor escolhido */
      el.gCon.setAttribute('y2', yConFim.toFixed(1));
      el.gWedge.setAttribute('points', X0 + ',' + Y0 + ' ' + X1 + ',' + YTOP + ' ' + X1 + ',' + yConFim.toFixed(1));
    }

    function desenharGrade(){
      var NS = 'http://www.w3.org/2000/svg', f = document.createDocumentFragment();
      el.grade.textContent = '';
      /* a grade nasce do prazo, não de uma lista fixa: com 60 meses as marcas
         de 90 e 120 cairiam fora do gráfico */
      [0, Math.round(N*0.25), Math.round(N*0.5), Math.round(N*0.75), N].forEach(function(m){
        var x = X0 + (m / N) * (X1 - X0);
        var ln = document.createElementNS(NS, 'line');
        ln.setAttribute('class', 'regua-grade');
        ln.setAttribute('x1', x); ln.setAttribute('y1', GY);
        ln.setAttribute('x2', x); ln.setAttribute('y2', Y0);
        f.appendChild(ln);
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('class', 'regua-eixo-txt');
        tx.setAttribute('x', x); tx.setAttribute('y', Y0 + LBL);
        tx.setAttribute('text-anchor', m === 0 ? 'start' : (m === N ? 'end' : 'middle'));
        tx.textContent = m === 0 ? 'mês 0' : (m === N ? N + ' meses' : String(m));
        f.appendChild(tx);
      });
      var base = document.createElementNS(NS, 'line');
      base.setAttribute('class', 'regua-grade');
      base.setAttribute('x1', X0); base.setAttribute('y1', Y0);
      base.setAttribute('x2', X1); base.setAttribute('y2', Y0);
      f.appendChild(base);
      el.grade.appendChild(f);
    }

    /* escritas travadas por delta: nada toca o DOM se o valor não mudou */
    var cache = { mes:-1, fin:'', con:'', econ:'', geo:-1 };

    function set(prog){
      var p = clamp(prog, 0, 1);
      var mes = Math.round(p * N);
      var x  = X0 + p * (X1 - X0);
      var yF = Y0 - p * (Y0 - YTOP);
      var yC = Y0 - p * (Y0 - yConFim);

      if (Math.abs(p - cache.geo) > 0.0012) {
        cache.geo = p;
        el.lFin.setAttribute('x2', x.toFixed(1));  el.lFin.setAttribute('y2', yF.toFixed(1));
        el.lCon.setAttribute('x2', x.toFixed(1));  el.lCon.setAttribute('y2', yC.toFixed(1));
        el.wedge.setAttribute('points', X0 + ',' + Y0 + ' ' + x.toFixed(1) + ',' + yF.toFixed(1) + ' ' + x.toFixed(1) + ',' + yC.toFixed(1));
        el.cabeca.setAttribute('x1', x.toFixed(1)); el.cabeca.setAttribute('x2', x.toFixed(1));
        el.pFin.setAttribute('cx', x.toFixed(1));  el.pFin.setAttribute('cy', yF.toFixed(1));
        el.pCon.setAttribute('cx', x.toFixed(1));  el.pCon.setAttribute('cy', yC.toFixed(1));
        el.hFin.setAttribute('cx', x.toFixed(1));  el.hFin.setAttribute('cy', yF.toFixed(1));
        el.hCon.setAttribute('cx', x.toFixed(1));  el.hCon.setAttribute('cy', yC.toFixed(1));
        el.cunha.setAttribute('x', (X0 + (x - X0) * 0.62).toFixed(1));
        el.cunha.setAttribute('y', ((yF + yC) / 2 + (yC - yF) * 0.24).toFixed(1));
        el.cunha.style.opacity = p > 0.14 ? '1' : '0';
      }

      if (mes !== cache.mes) {
        cache.mes = mes;
        el.mes.textContent = 'Mês ' + mes + ' de ' + N;
        var fFin = brl(totFin * (mes / N));
        var fCon = brl(totCon * (mes / N));
        var fEco = brl((totFin - totCon) * (mes / N));
        if (fFin !== cache.fin) { cache.fin = fFin; el.vFin.textContent = fFin; }
        if (fCon !== cache.con) { cache.con = fCon; el.vCon.textContent = fCon; }
        if (fEco !== cache.econ) {
          cache.econ = fEco;
          el.cunha.textContent = 'juros ' + fEco;
          if (el.econ) el.econ.textContent = fEco;
        }
      }
    }

    medirGeo();
    recalcular();
    return {
      desenharGrade: desenharGrade,
      /* uma virada de tela troca a geometria inteira e redesenha */
      remedir: function(p){ medirGeo(); recalcular(); desenharGrade(); cache.geo = -1; cache.mes = -1; set(p); },
      set: set,
      /* no hero estático a régua vive sempre no mês 120, e trocar o valor não pode zerá-la */
      pv: function(v){ PV = v; recalcular(); cache.mes = -1; cache.geo = -1; set(progAtual); },
      fim: function(){ set(1); }
    };
  })();

  (function(){
    var sl = document.getElementById('calcValor');
    if (!sl) return;
    var txt = document.getElementById('calcValorTexto'),
        fin = document.getElementById('calcFin'),
        con = document.getElementById('calcCon'),
        eco = document.getElementById('calcEcon'),
        bFin = document.getElementById('calcBarFin'),
        bCon = document.getElementById('calcBarCon'),
        dica = document.getElementById('calcDica'),
        prazoOpcoes = document.getElementById('calcPrazoOpcoes'),
        atalhos = document.querySelectorAll('.calc-atalhos button');   /* reatribuído ao trocar de modalidade */
    /* as taxas vêm de window.AstroTaxas, fonte única do site */
    var compor = function(pv){ return window.AstroTaxas.compor(pv); };

    function atualizar(){
      var pv = Number(sl.value);
      var c = compor(pv);
      var totalFin = c.fin.total, totalCon = c.con.total;

      /* a composição, linha a linha */
      function põe(id, v){ var e = document.getElementById(id); if (e) e.textContent = brl(v); }
      põe('compParcCon', c.con.parcela); põe('cCredito', c.con.credito);
      põe('cAdm', c.con.adm); põe('cFundo', c.con.fundo); põe('cSeg', c.con.seg);
      põe('compParcFin', c.fin.parcela); põe('fAmort', c.fin.amort);
      põe('fJuros', c.fin.juros); põe('fSeg', c.fin.seg); põe('fAdm', c.fin.banco);

      /* o resultado que fica na cara: parcela primeiro, resto em volta */
      var p = window.AstroTaxas.def();
      var semComparacao = p.comparacao === false;
      var admNumero = p.ADM * 100;
      var admTexto = (Number.isInteger(admNumero) ? admNumero.toFixed(0) : admNumero.toFixed(1)).replace('.', ',') + '%';
      var alternaveisBanco = [
        document.querySelector('.res-banco'),
        document.querySelector('.calc-barras'),
        document.querySelector('.calc-economia'),
        document.querySelector('.simulador-emenda'),
        document.querySelector('.regua'),
        document.querySelector('.comp-lado.ruim'),
        document.querySelector('.comp-rende'),
        document.querySelector('.comp-corpo > .comp-aviso')
      ];
      alternaveisBanco.forEach(function(el){ if (el) el.hidden = semComparacao; });
      var avisoComparacao = document.getElementById('calcComparacaoAviso');
      if (avisoComparacao) avisoComparacao.hidden = !semComparacao;
      var compLados = document.querySelector('.comp-lados');
      if (compLados) compLados.classList.toggle('sem-comparacao', semComparacao);
      var resultado = document.getElementById('calcResultado');
      if (resultado) resultado.classList.toggle('sem-comparacao', semComparacao);

      põe('resParcela', c.con.parcela);
      põe('resBanco',   c.fin.parcela);
      põe('resTotal',   c.con.total);
      var elPrazo = document.getElementById('resPrazo');
      if (elPrazo) elPrazo.textContent = p.N + ' meses';
      var nota = document.querySelector('.simulador > .calc-nota');
      if (nota) {
        var notaWa = ' <a href="https://wa.me/554599999999?text=Ol%C3%A1!%20Fiz%20uma%20simula%C3%A7%C3%A3o%20no%20site%20e%20quero%20confirmar%20os%20n%C3%BAmeros%20do%20meu%20caso." target="_blank" rel="noopener noreferrer" class="marca" style="text-decoration:underline;">Fale com um dos nossos vendedores</a> pra confirmar os números certos do seu caso antes de qualquer decisão.';
        if (semComparacao) {
          nota.innerHTML = 'Esta é uma simulação breve de consórcio para <span data-nota-prazo>' + p.N + '</span> meses, com taxa de administração de <span data-nota-adm>' + admTexto + '</span> diluída — só pra ter uma ideia. Fundo de reserva, seguro e a comparação com crédito bancário variam conforme a administradora, o perfil e a linha rural ou industrial do seu caso.' + notaWa;
        } else {
          nota.innerHTML = 'Esta é uma simulação breve para <span data-nota-prazo>' + p.N + '</span> meses, com juros de <span data-nota-juros>' + (p.I*100).toFixed(2).replace('.',',') + '%</span> ao mês e taxa de administração de <span data-nota-adm>' + admTexto + '</span> diluída — só pra ter uma ideia. Valores reais variam conforme a administradora, o grupo e o seu perfil.' + notaWa;
        }
      }
      var introComposicao = document.querySelector('.comp-intro');
      if (introComposicao) {
        introComposicao.innerHTML = semComparacao
          ? 'Parcela média em ' + p.N + ' meses, com <strong class="marca">os componentes do consórcio abertos</strong>. A comparação bancária será feita depois de identificar a linha de crédito adequada ao maquinário.'
          : 'Parcela média em ' + p.N + ' meses, com <strong class="marca">todas as linhas abertas</strong> nos dois lados. Nenhuma taxa escondida, nem a nossa.';
      }
      var elInd = document.getElementById('resIndice');
      if (elInd) elInd.textContent = p.indice;
      if (prazoOpcoes) prazoOpcoes.querySelectorAll('button').forEach(function(b){
        var ativo = Number(b.dataset.prazo) === p.N;
        b.classList.toggle('ativo', ativo);
        b.setAttribute('aria-pressed', String(ativo));
      });

      /* o dinheiro que não virou entrada */
      var r = window.AstroTaxas.rendimento(pv);
      põe('rEntrada', r.entrada); põe('rFinal', r.liquido); põe('rGanho', r.ganho);
      var elRP = document.getElementById('rPrazo');
      if (elRP) elRP.textContent = p.N + ' meses';

      txt.value = brl(pv);
      fin.textContent = brl(totalFin);
      con.textContent = brl(totalCon);
      eco.textContent = brl(totalFin - totalCon);
      bFin.style.width = '100%';
      bCon.style.width = ((totalCon / totalFin) * 100).toFixed(1) + '%';

      var grafico = document.getElementById('reguaSvg');
      if (grafico) grafico.setAttribute('aria-label', 'Gráfico da simulação em ' + p.N + ' meses: financiamento ' + brl(totalFin) + ' e consórcio ' + brl(totalCon) + '.');

      var pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
      sl.style.background = 'linear-gradient(90deg,#3B8FE0 0%,#7FD4FF ' + pct + '%,rgba(147,169,201,.16) ' + pct + '%,rgba(147,169,201,.16) 100%)';

      atalhos.forEach(function(bt){ bt.classList.toggle('ativo', Number(bt.dataset.v) === Number(sl.value)); });
      Regua.pv(pv);   /* a régua do hero passa a contar o SEU número */
    }

    var compAbre = document.getElementById('compAbre'), compCorpo = document.getElementById('compCorpo');
    if (compAbre) compAbre.addEventListener('click', function(){
      var aberto = compAbre.getAttribute('aria-expanded') === 'true';
      compAbre.setAttribute('aria-expanded', String(!aberto));
      compCorpo.hidden = aberto;
      compAbre.querySelector('span').textContent = aberto ? 'Ver a comparação completa' : 'Fechar a composição';
      if (!aberto) rastrear('ViewContent', { origem:'composicao-parcela' });
    });

    /* Valor e prazo usam a mesma fonte de verdade do gráfico e do formulário. */
    function montarPrazos(){
      if (!prazoOpcoes) return;
      var d = window.AstroTaxas.def();
      prazoOpcoes.innerHTML = '';
      d.prazos.forEach(function(n){
        var b = document.createElement('button');
        b.type = 'button'; b.dataset.prazo = n; b.textContent = n + ' meses';
        b.setAttribute('aria-pressed', String(n === d.N));
        b.classList.toggle('ativo', n === d.N);
        b.addEventListener('click', function(){
          window.AstroTaxas.prazo = n;
          Regua.remedir(1);
          atualizar();
          rastrear('ViewContent', { modalidade:window.AstroTaxas.modalidade, prazo:n });
        });
        prazoOpcoes.appendChild(b);
      });
    }

    /* O seletor reescreve a faixa do slider, os atalhos e os prazos disponíveis. */
    function trocarModo(modo){
      window.AstroTaxas.modalidade = modo;
      window.AstroTaxas.prazo = window.AstroTaxas.perfis[modo].N;
      var d = window.AstroTaxas.def();
      sl.min = d.min; sl.max = d.max; sl.step = d.passo; sl.value = d.padrao;

      var caixa = document.querySelector('.calc-atalhos');
      if (caixa){
        caixa.innerHTML = '';
        d.atalhos.forEach(function(a){
          var b = document.createElement('button');
          b.type = 'button'; b.dataset.v = a[0]; b.textContent = a[1];
          b.addEventListener('click', function(){
            sl.value = a[0]; atualizar();
            if (dica) dica.classList.add('oculta');
            rastrear('InitiateCheckout', { valor: a[0], modalidade: modo });
          });
          caixa.appendChild(b);
        });
        atalhos = caixa.querySelectorAll('button');
      }

      document.querySelectorAll('.calc-modo-bt[data-modo]').forEach(function(b){
        var ativo = b.dataset.modo === modo;
        b.classList.toggle('ativo', ativo);
        b.setAttribute('aria-pressed', String(ativo));
      });

      /* os rótulos que citam prazo e taxa acompanham */
      var rot = document.querySelector('.calc-label');
      if (rot) rot.textContent = 'Valor do ' + d.bem + ' que você quer';
      var esc = document.querySelectorAll('.calc-escala span');
      if (esc.length === 2){
        esc[0].textContent = brl(d.min).replace('R$ ', 'R$ ');
        esc[1].textContent = brl(d.max).replace('R$ ', 'R$ ');
      }
      var intro = document.querySelector('.comp-intro');
      if (intro) intro.innerHTML = 'Parcela média nos ' + d.N + ' meses, com <strong class="marca">todas as ' +
        'linhas abertas</strong> nos dois lados. Nenhuma taxa escondida, nem a nossa.';
      var eAdm = document.querySelector('#cAdm').closest('.comp-lin').querySelector('em');
      if (eAdm) {
        var admModo = d.ADM * 100;
        eAdm.textContent = (Number.isInteger(admModo) ? admModo.toFixed(0) : admModo.toFixed(1)).replace('.', ',') + '%';
      }
      var eFr = document.querySelector('#cFundo').closest('.comp-lin').querySelector('em');
      if (eFr) eFr.textContent = Math.round(d.FR * 100) + '%';
      var eJ = document.querySelector('#fJuros').closest('.comp-lin').querySelector('em');
      if (eJ) eJ.textContent = (d.I * 100).toFixed(2).replace('.', ',') + '% ao mês';
      var linBanco = document.querySelector('#fAdm').closest('.comp-lin').querySelector('span');
      if (linBanco) linBanco.firstChild.nodeValue = d.IOF ? 'Taxa do banco e IOF' : 'Taxa mensal do banco';
      var linSeg = document.querySelector('#fSeg').closest('.comp-lin').querySelector('span');
      if (linSeg) linSeg.firstChild.nodeValue = d.DFI ? 'Seguro MIP + DFI' : 'Seguro prestamista';
      montarPrazos();
      Regua.remedir(1);
      atualizar();
      rastrear('ViewContent', { modalidade: modo });
    }
    document.querySelectorAll('.calc-modo-bt[data-modo]').forEach(function(b){
      b.addEventListener('click', function(){ trocarModo(b.dataset.modo); });
    });

    sl.addEventListener('input', function(){ atualizar(); if (dica) dica.classList.add('oculta'); });
    if (txt) {
      txt.addEventListener('focus', function(){
        txt.value = String(Math.round(Number(sl.value)));
        txt.select();
      });
      var aplicarValorDigitado = function(){
        var digitos = txt.value.replace(/\D/g, '');
        var num = digitos ? Number(digitos) : Number(sl.value);
        num = Math.min(Number(sl.max), Math.max(Number(sl.min), num));
        sl.value = num;
        atualizar();
        if (dica) dica.classList.add('oculta');
      };
      txt.addEventListener('blur', aplicarValorDigitado);
      txt.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); aplicarValorDigitado(); txt.blur(); }
      });
    }
    atalhos.forEach(function(bt){
      bt.addEventListener('click', function(){
        sl.value = bt.dataset.v; atualizar();
        if (dica) dica.classList.add('oculta');
        rastrear('InitiateCheckout', { valor: bt.dataset.v });
      });
    });

    /* Leva modalidade e faixa de credito para o formulario, sem pedir que o
       visitante repita o que acabou de escolher no simulador. */
    var calcParaForm = document.getElementById('calcParaForm');
    if (calcParaForm) calcParaForm.addEventListener('click', function(e){
      e.preventDefault();
      var modo = window.AstroTaxas.modalidade;
      var valorAtual = Number(sl.value);
      var faixa = valorAtual <= 100000 ? '50-100' :
                  valorAtual <= 200000 ? '100-200' :
                  valorAtual <= 300000 ? '200-300' :
                  valorAtual <= 600000 ? '300-600' :
                  valorAtual <= 1000000 ? '600-1m' :
                  valorAtual <= 2000000 ? '1m-2m' : '2m+';

      function selecionar(alvo, valor){
        var select = document.getElementById(alvo);
        if (!select) return;
        select.value = valor;
        document.querySelectorAll('.escolha-cartao[data-alvo="' + alvo + '"]').forEach(function(b){
          var ativo = b.dataset.valor === valor;
          b.classList.toggle('sel', ativo);
          b.setAttribute('aria-pressed', String(ativo));
        });
        select.dispatchEvent(new Event('change', { bubbles:true }));
      }

      selecionar('modalidade', modo);
      selecionar('valor', faixa);
      selecionar('prazo', window.AstroTaxas.def().N + ' Meses');
      var quiz = document.getElementById('quiz-form');
      if (quiz) quiz.dataset.valorExato = brl(valorAtual);
      var resumo = document.getElementById('calcResumoForm');
      if (resumo) {
        resumo.innerHTML = 'Valores trazidos da calculadora: <strong>' + brl(valorAtual) + '</strong> em <strong>' + window.AstroTaxas.def().N + ' meses</strong>.';
        resumo.hidden = false;
      }
      document.querySelectorAll('.form-step').forEach(function(s){ s.classList.remove('active'); });
      var passo2 = document.getElementById('step-2');
      if (passo2) {
        passo2.classList.add('active');
        var indicador = passo2.querySelector('.step-indicator');
        if (indicador) indicador.textContent = 'Passo 2 de 3 · modalidade, valor e prazo já preenchidos';
      }
      var formulario = document.getElementById('form-simulador');
      if (formulario) formulario.scrollIntoView({ behavior:'smooth', block:'start' });
    });
    montarPrazos();
    atualizar();
  })();

  /* A "Estratégia de lance" deixou de ter simulador próprio aqui: virou um
     resumo estático (HTML puro, sem JS) com botão pra /lances.html, onde
     mora a simulação completa (evita duplicar a mesma calculadora em duas
     páginas). */

  /* modalidade da página (imóvel, veículo, maquinário) ou do link */
  if (modoInicial && modoInicial !== window.AstroTaxas.modalidade) {
    var bt = document.querySelector('.calc-modo-bt[data-modo="' + modoInicial + '"]');
    if (bt) { calado = true; bt.click(); calado = false; }
  }

  /* a régua se desenha quando o visitante chega nela — a mesma coreografia
     da página inicial (1,5 s, curva suave) */
  var reguaEl = document.getElementById('regua');
  var suave = function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; };
  var desenhada = false;
  function desenhar(){
    if (desenhada) return;
    desenhada = true;
    var t0 = 0;
    function passo(now){
      if (!t0) t0 = now;
      var k = clamp((now - t0) / 1500, 0, 1);
      progAtual = suave(k); Regua.set(progAtual);
      if (k < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  Regua.desenharGrade();
  if (mqMr.matches || !reguaEl || !('IntersectionObserver' in window)) { progAtual = 1; Regua.set(1); desenhada = true; }
  else {
    Regua.set(0); progAtual = 0;
    new IntersectionObserver(function(es, obs){
      if (!es[0].isIntersecting) return;
      obs.disconnect(); desenhar();
    }, { threshold: 0.35 }).observe(reguaEl);
  }
  var tRedim = null;
  window.addEventListener('resize', function(){
    clearTimeout(tRedim);
    tRedim = setTimeout(function(){ Regua.remedir(progAtual); }, 220);
  });
})();
