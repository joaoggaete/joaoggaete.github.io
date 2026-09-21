/* ==========================================================================
   NAV COMPARTILHADO — comportamento (menu mobile, busca, tema).
   Carregado só nas páginas que ainda não têm essa lógica embutida no próprio
   script (index.html, como-funciona.html e exterior.html mantêm a cópia
   própria, já testada, pra não arriscar um clique duplo no botão de tema).
   As demais páginas usam este arquivo como única fonte do comportamento.
   ========================================================================== */
(function(){
  'use strict';

  /* ------------------------------------------------------------------
     BUSCA — mesmo índice do site inteiro, com caminho absoluto em cada
     item pra funcionar não importa de qual página a busca foi aberta.
     ------------------------------------------------------------------ */
  var INDICE = [
    { tit:'Página inicial', cat:'Página', url:'/' },
    { tit:'Como funciona o consórcio', cat:'Página', url:'/como-funciona.html' },
    { tit:'Brasileiros no exterior', cat:'Página', url:'/exterior.html' },
    { tit:'Segurança e privacidade', cat:'Página', url:'/seguranca.html' },
    { tit:'Política de privacidade', cat:'Página', url:'/privacidade.html' },
    { tit:'Simulador de parcela mês a mês', cat:'Seção', url:'/#calculadora' },
    { tit:'Como o consórcio realmente funciona', cat:'Seção', url:'/#verdade' },
    { tit:'Modalidades: imóveis, veículos e maquinário', cat:'Seção', url:'/#estruturas' },
    { tit:'O que muda quando a Astro acompanha', cat:'Seção', url:'/#diferencial-astro' },
    { tit:'Atendimento: WhatsApp, vídeo ou presencial', cat:'Seção', url:'/#onde-estamos' },
    { tit:'Três leituras que valem o seu tempo', cat:'Seção', url:'/#saiba-mais' },
    { tit:'Simule seu crédito', cat:'Seção', url:'/#form-simulador' },
    { tit:'Um vídeo pra cada forma de usar', cat:'Seção', url:'/#lequeCarrossel' },
    { tit:'Perguntas frequentes', cat:'Seção', url:'/#duvidas' },
    { tit:'Como a Astro trabalha o seu caso', cat:'Seção', url:'/como-funciona.html#planejamento' },
    { tit:'Simulador de prazo', cat:'Seção', url:'/como-funciona.html#prazos' },
    { tit:'Como funciona para fechar o contrato', cat:'Seção', url:'/como-funciona.html#como-fechar' },
    { tit:'O que é o lance embutido?', cat:'Dúvida', url:'/#faq-r0' },
    { tit:'Como a Astro otimiza a contemplação?', cat:'Dúvida', url:'/#faq-r1' },
    { tit:'Vou ficar preso pagando sem saber quando serei contemplado?', cat:'Dúvida', url:'/#faq-r2' },
    { tit:'Posso usar o meu FGTS no processo?', cat:'Dúvida', url:'/#faq-r3' },
    { tit:'Como funciona o reajuste das parcelas?', cat:'Dúvida', url:'/#faq-r4' },
    { tit:'A Astro cobra alguma taxa extra pelo serviço?', cat:'Dúvida', url:'/#faq-r5' },
    { tit:'Preciso dar entrada?', cat:'Dúvida', url:'/#faq-r6' },
    { tit:'Posso desistir do consórcio? O dinheiro volta?', cat:'Dúvida', url:'/#faq-r7' }
  ];

  function normaliza(s){
    return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  }
  function distancia(a, b){
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var d = [];
    for (var i=0;i<=m;i++){ d[i] = [i]; }
    for (var j=0;j<=n;j++){ d[0][j] = j; }
    for (var i2=1;i2<=m;i2++){
      for (var j2=1;j2<=n;j2++){
        var custo = a.charAt(i2-1)===b.charAt(j2-1) ? 0 : 1;
        var valor = Math.min(d[i2-1][j2]+1, d[i2][j2-1]+1, d[i2-1][j2-1]+custo);
        if (i2>1 && j2>1 && a.charAt(i2-1)===b.charAt(j2-2) && a.charAt(i2-2)===b.charAt(j2-1)){
          valor = Math.min(valor, d[i2-2][j2-2]+1);
        }
        d[i2][j2] = valor;
      }
    }
    return d[m][n];
  }
  function pontua(item, palavrasQuery){
    var alvo = normaliza(item.tit);
    var palavrasAlvo = alvo.split(/\s+/);
    var total = 0;
    for (var i=0;i<palavrasQuery.length;i++){
      var q = palavrasQuery[i];
      if (!q) continue;
      var melhor = 0;
      if (alvo.indexOf(q) !== -1) melhor = q.length >= 3 ? 10 : 5;
      for (var j=0;j<palavrasAlvo.length;j++){
        var p = palavrasAlvo[j];
        var d = distancia(q, p);
        var tolerancia = Math.max(1, Math.floor(p.length*0.34));
        if (d <= tolerancia && (8-d) > melhor) melhor = 8-d;
      }
      if (melhor === 0) return 0;
      total += melhor;
    }
    return total;
  }

  function initBusca(){
    var btn = document.getElementById('buscaBtn');
    var painel = document.getElementById('buscaPainel');
    var input = document.getElementById('buscaInput');
    var lista = document.getElementById('buscaResultados');
    var vazio = document.getElementById('buscaVazio');
    if (!btn || !painel || !input || !lista || !vazio) return;

    function abre(){
      painel.hidden = false; btn.classList.add('aberto'); btn.setAttribute('aria-expanded','true');
      setTimeout(function(){ input.focus(); }, 10);
    }
    function fecha(){
      painel.hidden = true; btn.classList.remove('aberto'); btn.setAttribute('aria-expanded','false');
    }
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      if (painel.hidden) abre(); else fecha();
    });
    document.addEventListener('click', function(e){
      if (!painel.hidden && !painel.contains(e.target) && e.target !== btn) fecha();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !painel.hidden) { fecha(); btn.focus(); }
    });

    function renderiza(query){
      lista.innerHTML = '';
      if (!query.trim()){ vazio.hidden = true; return; }
      var palavras = normaliza(query).split(/\s+/).filter(Boolean);
      var resultados = INDICE
        .map(function(item){ return { item:item, pontos: pontua(item, palavras) }; })
        .filter(function(r){ return r.pontos > 0; })
        .sort(function(a,b){ return b.pontos - a.pontos; })
        .slice(0, 7);

      if (!resultados.length){ vazio.hidden = false; return; }
      vazio.hidden = true;
      resultados.forEach(function(r){
        var li = document.createElement('li');
        li.className = 'busca-item';
        var a = document.createElement('a');
        a.href = r.item.url;
        var tit = document.createElement('span'); tit.className = 'busca-item-tit'; tit.textContent = r.item.tit;
        var cat = document.createElement('span'); cat.className = 'busca-item-cat'; cat.textContent = r.item.cat;
        a.appendChild(tit); a.appendChild(cat);
        a.addEventListener('click', function(){ fecha(); input.value = ''; });
        li.appendChild(a);
        lista.appendChild(li);
      });
    }
    input.addEventListener('input', function(){ renderiza(input.value); });
  }

  /* ------------------------------------------------------------------
     MENU MOBILE (hambúrguer)
     ------------------------------------------------------------------ */
  function initMenu(){
    var b = document.getElementById('navBurger'), p = document.getElementById('navPainel');
    if (!b || !p) return;
    function fecha(){
      b.classList.remove('aberto'); p.classList.remove('aberto');
      document.body.classList.remove('menu-aberto');
      b.setAttribute('aria-expanded','false'); b.setAttribute('aria-label','Abrir menu');
      /* reabrir o menu não deve mostrar um acordeão que ficou aberto da
         última vez */
      p.querySelectorAll('.nav-drop.aberto').forEach(function(d){
        d.classList.remove('aberto');
        var db = d.querySelector('.nav-drop-btn');
        if (db) db.setAttribute('aria-expanded', 'false');
      });
    }
    function abre(){
      document.body.classList.add('menu-aberto');
      var barra = document.querySelector('nav');
      p.style.top = (barra ? Math.max(0, barra.getBoundingClientRect().bottom) : 0) + 'px';
      b.classList.add('aberto'); p.classList.add('aberto');
      b.setAttribute('aria-expanded','true'); b.setAttribute('aria-label','Fechar menu');
    }
    function ancorar(){
      if (!p.classList.contains('aberto')) return;
      var barra = document.querySelector('nav');
      p.style.top = (barra ? Math.max(0, barra.getBoundingClientRect().bottom) : 0) + 'px';
    }
    window.addEventListener('scroll', ancorar, { passive:true });
    window.addEventListener('resize', ancorar);
    b.addEventListener('click', function(){ p.classList.contains('aberto') ? fecha() : abre(); });
    p.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', fecha); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') fecha(); });
    document.addEventListener('click', function(e){
      if (!p.classList.contains('aberto')) return;
      if (p.contains(e.target) || b.contains(e.target)) return;
      fecha();
    });
    window.addEventListener('resize', function(){ if (window.innerWidth > 1024) fecha(); });
  }

  /* ------------------------------------------------------------------
     TÓPICOS COM SUBMENU ("Nosso Produto", "Atendimento") — mesmo
     markup (.nav-drop / .nav-drop-btn / .nav-drop-menu) serve pro
     dropdown flutuante do desktop e pro acordeão dentro do menu mobile;
     só o CSS muda a apresentação conforme o contêiner.
     ------------------------------------------------------------------ */
  function initDropdowns(){
    var drops = document.querySelectorAll('.nav-drop');
    if (!drops.length) return;
    function fechaTodos(exceto){
      drops.forEach(function(d){
        if (d === exceto) return;
        d.classList.remove('aberto');
        var b = d.querySelector('.nav-drop-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    drops.forEach(function(d){
      var btn = d.querySelector('.nav-drop-btn');
      if (!btn) return;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var abrindo = !d.classList.contains('aberto');
        fechaTodos(abrindo ? d : null);
        d.classList.toggle('aberto', abrindo);
        btn.setAttribute('aria-expanded', String(abrindo));
      });
      d.querySelectorAll('.nav-drop-menu a').forEach(function(a){
        a.addEventListener('click', function(){
          d.classList.remove('aberto');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    });
    document.addEventListener('click', function(e){
      var dentro = e.target.closest ? e.target.closest('.nav-drop') : null;
      if (!dentro) fechaTodos(null);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') fechaTodos(null);
    });
  }

  /* ------------------------------------------------------------------
     NAV SÓLIDA AO ROLAR
     ------------------------------------------------------------------ */
  function initRolagem(){
    var nav = document.querySelector('nav');
    if (!nav) return;
    var ultSolida = null;
    function atualiza(){
      var solida = window.scrollY > 40;
      if (solida !== ultSolida) { ultSolida = solida; nav.classList.toggle('solida', solida); }
    }
    window.addEventListener('scroll', atualiza, { passive:true });
    atualiza();
  }

  /* ------------------------------------------------------------------
     TEMA CLARO E ESCURO
     ------------------------------------------------------------------ */
  function initTema(){
    var raiz = document.documentElement;
    var mqClaro = window.matchMedia('(prefers-color-scheme: light)');
    var meta = document.querySelector('meta[name="theme-color"]');

    function escolhido(){
      var t = raiz.getAttribute('data-tema');
      return (t === 'claro' || t === 'escuro') ? t : null;
    }
    function claroAgora(){
      var e = escolhido();
      if (e) return e === 'claro';
      return mqClaro.matches;
    }
    function aplicar(){
      var claro = claroAgora();
      raiz.classList.toggle('t-claro', claro);
      raiz.style.colorScheme = claro ? 'light' : 'dark';
      if (meta) meta.setAttribute('content', claro ? '#FFFFFF' : '#03060F');
      document.querySelectorAll('.tema-btn').forEach(function(b){
        b.setAttribute('aria-label', claro ? 'Mudar para o modo escuro' : 'Mudar para o modo claro');
        b.setAttribute('aria-pressed', claro ? 'true' : 'false');
      });
      var rot = document.querySelector('.tema-linha .rotulo');
      if (rot) rot.textContent = claro ? 'Modo claro' : 'Modo escuro';
    }
    function alternar(){
      var claro = claroAgora();
      try {
        localStorage.setItem('astro-tema', claro ? 'escuro' : 'claro');
        localStorage.setItem('astro-tema-v2', claro ? 'escuro' : 'claro');
      } catch(e){}
      raiz.setAttribute('data-tema', claro ? 'escuro' : 'claro');
      aplicar();
    }
    mqClaro.addEventListener('change', function(){ if (!escolhido()) aplicar(); });
    document.addEventListener('click', function(e){
      var b = e.target && e.target.closest ? e.target.closest('.tema-btn') : null;
      if (b) { e.preventDefault(); alternar(); }
    });
    aplicar();
  }

  /* Cada página chama só o que precisa: as 5 páginas sem nav própria (sem
     busca, sem menu, sem tema) chamam .tudo(); como-funciona.html e
     exterior.html já têm menu e tema funcionando (script próprio, já
     testado) e só precisavam da busca, então chamam .initBusca() sozinho —
     carregar o resto de novo dali criaria um segundo ouvinte de clique nos
     mesmos botões. */
  function tudo(){
    initBusca();
    initMenu();
    initDropdowns();
    initRolagem();
    initTema();
  }
  function expor(){
    window.AstroNav = {
      initBusca: initBusca,
      initMenu: initMenu,
      initDropdowns: initDropdowns,
      initRolagem: initRolagem,
      initTema: initTema,
      tudo: tudo
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', expor);
  else expor();
})();
