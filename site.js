/* ==========================================================================
   SITE.JS — comportamento das páginas de conteúdo
   1. aviso de cookies e medição (nada é medido sem "sim")
   2. formulário de simulação: grava o pedido no servidor e abre o WhatsApp
   3. vídeos: carregam só no play, um por vez, com chamada no final
   4. barra fixa do celular some quando o formulário está na tela
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP = '554599999999';
  var NOMES_MOD = { imovel: 'Imóvel', carro: 'Veículo', maquinario: 'Maquinário' };
  var NOMES_VALOR = { '50-100': 'R$ 50 mil a R$ 100 mil', '100-200': 'R$ 100 mil a R$ 200 mil', '200-300': 'R$ 200 mil a R$ 300 mil',
    '300-600': 'R$ 300 mil a R$ 600 mil', '600-1m': 'R$ 600 mil a R$ 1 milhão', '1m-2m': 'R$ 1 a R$ 2 milhões', '2m+': 'Acima de R$ 2 milhões' };
  var NOMES_LANCE = { sim: 'Sim, tenho recurso próprio', nao: 'Não, quero contemplar por sorteio', indefinido: 'Não sei / lance embutido' };

  /* ---------------- 1. consentimento e medição ---------------- */
  var CHAVE = 'astro-consentimento';
  function lido() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function grava(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }
  window.AstroConsentimento = window.AstroConsentimento || { permitido: function () { return lido() === 'sim'; }, escolha: lido };
  window.AstroMedicao = window.AstroMedicao || { ligar: function () { /* IDs do Pixel/GA entram aqui */ } };
  if (typeof window.rastrear !== 'function') {
    window.rastrear = function (evento, dados) {
      try { if (!window.AstroConsentimento.permitido()) return; } catch (e) { return; }
      try { if (typeof fbq === 'function') fbq('track', evento, dados || {}); } catch (e) {}
      try { if (typeof gtag === 'function') gtag('event', evento, dados || {}); } catch (e) {}
    };
  }
  function iniciaConsentimento() {
    var caixa = document.getElementById('consent');
    if (!caixa) return;
    if (lido()) { if (lido() === 'sim') window.AstroMedicao.ligar(); return; }
    caixa.hidden = false;
    document.getElementById('consentSim').addEventListener('click', function () { grava('sim'); caixa.hidden = true; window.AstroMedicao.ligar(); });
    document.getElementById('consentNao').addEventListener('click', function () { grava('nao'); caixa.hidden = true; });
  }

  /* ---------------- 2. formulário de simulação ---------------- */
  function origem() { return typeof window.AstroOrigem === 'function' ? window.AstroOrigem() : {}; }

  function ajustaPrazos(form) {
    var mod = (form.querySelector('input[name=modalidade]:checked') || {}).value;
    var so = form.querySelectorAll('select[name=prazo] option[data-so-imovel]');
    var sel = form.querySelector('select[name=prazo]');
    so.forEach(function (o) {
      /* 180 e 240 meses só existem para imóvel */
      var esconde = mod && mod !== 'imovel';
      o.hidden = esconde; o.disabled = esconde;
      if (esconde && sel.value === o.value) sel.value = '';
    });
  }

  function mensagemWhats(d) {
    return 'Olá! Quero uma simulação da Astro.' +
      '\n\nNome: ' + d.nome +
      (d.modalidade ? '\nQuero conquistar: ' + (NOMES_MOD[d.modalidade] || d.modalidade) : '') +
      (d.valor ? '\nCrédito: ' + (NOMES_VALOR[d.valor] || d.valor) : '') +
      (d.prazo ? '\nPrazo: ' + d.prazo.replace('Meses', 'meses') : '') +
      (d.lance ? '\nReserva para lance: ' + (NOMES_LANCE[d.lance] || d.lance) : '') +
      (d.exterior ? '\nMoro fora do Brasil' : '');
  }

  function iniciaFormulario(form) {
    var caixa = form.closest('.lead-caixa');
    var ok = caixa && caixa.querySelector('.lead-ok');
    var erro = form.querySelector('.lf-erro');

    /* modalidade pré-escolhida: pela página (data-modalidade) ou pelo link
       (?modalidade=imovel, vindo de um anúncio ou de outra página) */
    var q = new URLSearchParams(location.search);
    var pre = q.get('modalidade') || form.dataset.modalidade;
    if (pre) { var r = form.querySelector('input[name=modalidade][value="' + pre + '"]'); if (r) r.checked = true; }
    if (q.get('para') === 'exterior' || form.dataset.canal === 'exterior') { var ex = form.querySelector('input[name=exterior]'); if (ex) ex.checked = true; }
    if (q.get('valor')) { var v = form.querySelector('select[name=valor]'); if (v) v.value = q.get('valor'); }
    ajustaPrazos(form);
    form.querySelectorAll('input[name=modalidade]').forEach(function (r) { r.addEventListener('change', function () { ajustaPrazos(form); }); });

    var comecou = false;
    form.addEventListener('focusin', function () {
      if (comecou) return; comecou = true;
      window.rastrear('InitiateCheckout', { origem: form.dataset.canal || 'formulario', pagina: location.pathname });
    });
    form.querySelectorAll('input, select').forEach(function (c) { c.addEventListener('input', function () { c.classList.remove('invalido'); }); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      erro.hidden = true;
      var f = new FormData(form);
      var d = {
        nome: String(f.get('nome') || '').trim(),
        whatsapp: String(f.get('whatsapp') || '').trim(),
        modalidade: String(f.get('modalidade') || ''),
        valor: String(f.get('valor') || ''),
        prazo: String(f.get('prazo') || ''),
        lance: String(f.get('lance') || ''),
        exterior: !!f.get('exterior'),
        empresa_site: String(f.get('empresa_site') || '')
      };
      var problemas = [];
      if (!d.modalidade) problemas.push(['modalidade', 'Escolha o que você quer conquistar.']);
      if (!d.valor) problemas.push(['valor', 'Escolha a faixa de crédito.']);
      if (d.nome.length < 2) problemas.push(['nome', 'Escreva seu nome.']);
      if (d.whatsapp.replace(/\D/g, '').length < 10) problemas.push(['whatsapp', 'Escreva um WhatsApp com DDD.']);
      if (problemas.length) {
        problemas.forEach(function (p) { form.querySelectorAll('[name="' + p[0] + '"]').forEach(function (el) { (el.type === 'radio' ? el.nextElementSibling : el).classList.add('invalido'); }); });
        erro.textContent = problemas[0][1]; erro.hidden = false;
        var alvo = form.querySelector('[name="' + problemas[0][0] + '"]'); if (alvo && alvo.focus) alvo.focus();
        return;
      }

      var canal = d.exterior ? 'exterior' : (form.dataset.canal || 'formulario');
      var corpo = { nome: d.nome, whatsapp: d.whatsapp, modalidade: d.modalidade, valor: d.valor, prazo: d.prazo, lance: d.lance,
        canal: canal, pagina: location.pathname, origem: origem(), empresa_site: d.empresa_site };

      /* 1º grava no servidor — sem esperar: keepalive garante que o pedido
         sai mesmo que a aba perca o foco para o WhatsApp. Se o servidor não
         existir (site aberto sem PHP), nada quebra: o WhatsApp segue. */
      try {
        fetch('/api/leads.php', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo), keepalive: true, credentials: 'same-origin' }).catch(function () {});
      } catch (e) {}

      /* 2º abre o WhatsApp ainda dentro do clique (senão o navegador bloqueia) */
      var link = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagemWhats(d));
      window.open(link, '_blank', 'noopener');
      window.rastrear('Lead', { modalidade: d.modalidade, valor_credito: d.valor, canal: canal, pagina: location.pathname });

      if (ok) {
        var zap = ok.querySelector('.lead-ok-wa'); if (zap) zap.href = link;
        form.hidden = true; ok.hidden = false;
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ---------------- 3. vídeos ---------------- */
  var tocando = [];
  function iniciaVideo(palco) {
    var capa = palco.querySelector('.video-capa');
    if (!capa) return;
    capa.addEventListener('click', function () {
      var v = document.createElement('video');
      v.src = palco.dataset.src;
      v.poster = palco.dataset.poster || '';
      v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-label', capa.getAttribute('aria-label') || 'Vídeo');
      v.addEventListener('play', function () { tocando.forEach(function (o) { if (o !== v && !o.paused) o.pause(); }); });
      v.addEventListener('ended', function () {
        var fim = palco.querySelector('.video-fim');
        if (fim) fim.hidden = false;
        window.rastrear('ViewContent', { midia: palco.dataset.id, concluido: true });
      });
      v.addEventListener('error', function () {
        var p = document.createElement('p');
        p.className = 'video-fim'; p.textContent = 'Não deu para carregar o vídeo agora. Tente de novo em instantes.';
        v.replaceWith(p);
      });
      tocando.push(v);
      capa.replaceWith(v);
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      window.rastrear('ViewContent', { midia: palco.dataset.id });
    });
    var rever = palco.querySelector('.video-rever');
    if (rever) rever.addEventListener('click', function () {
      var v = palco.querySelector('video'); var fim = palco.querySelector('.video-fim');
      if (fim) fim.hidden = true; if (v) { v.currentTime = 0; v.play(); }
    });
  }

  /* ---------------- 4. barra fixa do celular ---------------- */
  function iniciaBarraFixa() {
    var barra = document.querySelector('.cta-fixo');
    var alvos = document.querySelectorAll('.lead-caixa, .rodape');
    if (!barra || !alvos.length || !('IntersectionObserver' in window)) return;
    var visiveis = new Set();
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target); });
      barra.classList.toggle('recolhido', visiveis.size > 0);
    }, { threshold: 0.05 });
    alvos.forEach(function (a) { io.observe(a); });
  }

  function iniciar() {
    iniciaConsentimento();
    document.querySelectorAll('form.lead-form').forEach(iniciaFormulario);
    document.querySelectorAll('.video-palco[data-src]').forEach(iniciaVideo);
    iniciaBarraFixa();
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener('click', function () { window.rastrear('Contact', { origem: 'link', pagina: location.pathname }); });
    });
    if (window.AstroNav) window.AstroNav.tudo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
