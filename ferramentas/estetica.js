#!/usr/bin/env node
/* ============================================================================
   ESTÉTICA COMPARTILHADA — a página inicial é a fonte, as outras herdam
   O index.html tem a identidade visual do site: a fita de metal líquido no
   fundo, o grão, o cartão de vidro, os títulos de seção e o simulador com a
   régua do tempo. As páginas de imóvel, veículo, maquinário, simular, sobre,
   contato, dúvidas e vídeos precisam do MESMO visual e do MESMO simulador —
   não de uma cópia parecida que vai se afastando a cada ajuste.

   Este módulo lê o index.html e gera:
     estetica.css  só as regras dessas peças (com os tokens de cor dos dois
                   temas), copiadas do <style> do index, na mesma ordem;
     estetica.js   a Fita, a Régua e a Calculadora, copiadas do script do
                   index, com uma camada fina que liga tudo numa página comum;
     e a marcação do simulador, que o layout.js carimba nas páginas entre
       <!-- #simulador modo=carro --> … <!-- /simulador -->

   Não roda sozinho: o layout.js chama. Mudou algo no index? Rode
       node ferramentas/layout.js
   e as outras páginas acompanham.
   ========================================================================= */
'use strict';

/* ---------------------------------------------------------------- CSS ---- */

/* As peças que as outras páginas herdam. Casa por nome de classe/id inteiro
   (".calc-" pega a família do simulador inteira). */
const PECAS = [
  /\.ambiente(?:-glow)?(?![\w-])/, /#fluxo(?![\w-])/, /#estrelas(?![\w-])/, /\.grao(?![\w-])/,
  /\.vidro(?![\w-])/,
  /#calculadora(?![\w-])/, /\.simulador(?:-[\w-]+)?(?![\w-])/, /\.sim-entrada(?![\w-])/,
  /\.calc-[\w-]+/, /\.res-[\w-]+/, /\.composicao(?![\w-])/,
  /\.comp-(?:abre|sinal|corpo|intro|lados?|cab|lin|juros|alerta|rende(?:-[\w-]+)?|aviso)(?![\w-])/,
  /\.regua(?:-[\w-]+)?(?![\w-])/, /#regua(?![\w-])/, /input\[type=range\]/,
  /\.sec-head(?![\w-])/, /\.eyebrow(?![\w-])/, /\.section-title(?![\w-])/, /\.section-sub(?![\w-])/, /\.marca(?![\w-])/,
];
/* Menu e rodapé têm folha própria (nav.css), e o index sobrescreve partes
   deles para a home. Nada disso pode vazar para as outras páginas. */
const FORA = /(?:^|[\s>+~(,])(?:nav|footer)(?![\w-])|\.nav-|\.footer-|\.hero(?![\w-])|\.hero-|\.modal|\.leque|\.carrossel/;

/* A raiz em cada tema: dela só interessam os tokens (--*), o fundo e o
   esquema de cor. O resto (overflow, rolagem, fonte do body) cada página já tem. */
const RAIZ = /^(?::root|html)(?:\[data-tema="(?:claro|escuro)"\]|:not\(\[data-tema="escuro"\]\)|\.t-claro)*$/;
const CORPO_TEMA = /^(?::root|html)(?:\[data-tema="(?:claro|escuro)"\]|:not\(\[data-tema="escuro"\]\))+\s+body$/;

function casa(sel) { return PECAS.some(r => r.test(sel)); }

/* divide por vírgula só no nível de fora (nem dentro de parênteses, nem de aspas) */
function dividir(txt, sep) {
  const partes = [];
  let d = 0, q = null, ini = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(' || c === '[') d++;
    else if (c === ')' || c === ']') d--;
    else if (c === sep && d === 0) { partes.push(txt.slice(ini, i)); ini = i + 1; }
  }
  partes.push(txt.slice(ini));
  return partes;
}

/* :is(.vidro,.modal-card,…) vira :is(.vidro) — só as peças herdadas ficam,
   senão cartões que só existem na home ganhariam estilo nas outras páginas */
function filtrarIs(sel) {
  let out = '', i = 0;
  while (i < sel.length) {
    const m = /^:(is|where)\(/.exec(sel.slice(i));
    if (!m) { out += sel[i++]; continue; }
    const ini = i + m[0].length;
    let d = 1, j = ini;
    while (j < sel.length && d) { if (sel[j] === '(') d++; else if (sel[j] === ')') d--; j++; }
    const args = dividir(sel.slice(ini, j - 1), ',').map(s => s.trim()).filter(Boolean);
    const bons = args.filter(casa);
    out += ':' + m[1] + '(' + (bons.length ? bons : args).join(',') + ')';
    i = j;
  }
  return out;
}

/* árvore mínima: regra, bloco (@media/@supports) ou at-rule crua (@keyframes) */
function parse(css) {
  const nos = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    let j = i, d = 0, q = null;
    for (; j < css.length; j++) {
      const c = css[j];
      if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '(') d++;
      else if (c === ')') d--;
      else if (d === 0 && (c === '{' || c === ';' || c === '}')) break;
    }
    if (j >= css.length) break;
    if (css[j] === ';' || css[j] === '}') { i = j + 1; continue; }
    const prelude = css.slice(i, j).trim();
    let k = j + 1, dd = 1; q = null;
    for (; k < css.length && dd; k++) {
      const c = css[k];
      if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '{') dd++;
      else if (c === '}') dd--;
    }
    const corpo = css.slice(j + 1, k - 1);
    if (/^@(media|supports|layer|container)\b/i.test(prelude)) nos.push({ tipo: 'bloco', prelude, filhos: parse(corpo) });
    else if (prelude[0] === '@') nos.push({ tipo: 'at', prelude, corpo });
    else nos.push({ tipo: 'regra', sel: prelude, corpo });
    i = k;
  }
  return nos;
}

function soDeclaracoes(corpo, aceita) {
  return dividir(corpo, ';').map(s => s.trim()).filter(Boolean).filter(dcl => {
    const prop = dcl.slice(0, dcl.indexOf(':')).trim().toLowerCase();
    return aceita(prop);
  }).join('; ');
}

const limpa = s => s.replace(/\s+/g, ' ').trim();

function filtrar(nos, animacoes, recuo) {
  const saida = [];
  for (const no of nos) {
    if (no.tipo === 'bloco') {
      const dentro = filtrar(no.filhos, animacoes, recuo + '  ');
      if (dentro.length) saida.push(recuo + limpa(no.prelude) + '{\n' + dentro.join('\n') + '\n' + recuo + '}');
      continue;
    }
    if (no.tipo !== 'regra') continue;
    const partes = dividir(no.sel, ',').map(s => limpa(s)).filter(Boolean);
    const pecas = [], raiz = [], corpoTema = [];
    for (const p of partes) {
      if (RAIZ.test(p)) { raiz.push(p); continue; }
      if (CORPO_TEMA.test(p)) { corpoTema.push(p); continue; }
      const f = filtrarIs(p);
      if (casa(f) && !FORA.test(f)) pecas.push(f);
    }
    if (pecas.length) {
      const corpo = limpa(no.corpo);
      saida.push(recuo + pecas.join(', ') + '{ ' + corpo + ' }');
      corpo.replace(/animation(?:-name)?\s*:([^;]+)/g, (m, v) => { v.split(/[\s,]+/).forEach(n => animacoes.add(n)); });
    }
    if (raiz.length) {
      const c = soDeclaracoes(no.corpo, p => p.startsWith('--') || p === 'color-scheme' || p.startsWith('background'));
      if (c) saida.push(recuo + raiz.join(', ') + '{ ' + limpa(c) + ' }');
    }
    if (corpoTema.length) {
      const c = soDeclaracoes(no.corpo, p => p === 'color' || p.startsWith('background'));
      if (c) saida.push(recuo + corpoTema.join(', ') + '{ ' + limpa(c) + ' }');
    }
  }
  return saida;
}

function keyframes(nos, usadas, saida) {
  for (const no of nos) {
    if (no.tipo === 'bloco') keyframes(no.filhos, usadas, saida);
    else if (no.tipo === 'at') {
      const m = /^@(?:-webkit-)?keyframes\s+([\w-]+)/.exec(no.prelude);
      if (m && usadas.has(m[1])) saida.push(limpa(no.prelude) + '{ ' + limpa(no.corpo) + ' }');
    }
  }
}

function gerarCss(index) {
  const semComentarioHtml = index.replace(/<!--[\s\S]*?-->/g, '');
  let css = '';
  semComentarioHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (m, c) => { css += c + '\n'; });
  if (!css) throw new Error('estetica: não achei <style> no index.html');
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const arvore = parse(css);
  const animacoes = new Set();
  const regras = filtrar(arvore, animacoes, '');
  const quadros = [];
  keyframes(arvore, animacoes, quadros);
  if (!regras.some(r => r.includes('.simulador')) || !regras.some(r => r.includes('#fluxo')) || !regras.some(r => r.startsWith('.vidro')))
    throw new Error('estetica: o CSS extraído do index perdeu o simulador, a fita ou o vidro — algum seletor mudou de nome?');
  return [
    '/* ==========================================================================',
    '   ESTETICA.CSS — GERADO por ferramentas/estetica.js a partir do index.html.',
    '   Não edite aqui: a próxima rodada de "node ferramentas/layout.js" apaga.',
    '   São as regras da fita (fundo animado), do grão, do cartão de vidro, dos',
    '   títulos de seção e do simulador, com os tokens de cor dos dois temas —',
    '   as mesmas da página inicial, na mesma ordem.',
    '   ========================================================================== */',
    '',
    '/* O index zera margin/padding de tudo; as outras páginas não. Sem esta base,',
    '   parágrafos e títulos do simulador ganhariam as margens do site.css. */',
    '.simulador :where(p,h1,h2,h3,h4,ul,ol,li,dl,dd,figure,blockquote), .sec-head :where(p,h1,h2,h3){ margin:0; padding:0 }',
    '.simulador :where(button,input,select,textarea){ font:inherit; color:inherit }',
    '.simulador :where(a){ color:inherit; text-decoration:none }',
    '/* a fita é fixa atrás de tudo; o conteúdo sobe acima dela (como no index) */',
    'main, footer, .rodape{ position:relative; z-index:1 }',
    '',
    regras.join('\n'),
    '',
    quadros.join('\n'),
    '',
  ].join('\n');
}

/* ----------------------------------------------------------------- JS ---- */

/* recorta do script do index o trecho que começa em "inicio" e vai até o
   próximo cabeçalho de módulo ("\n  /* ====") */
function recorte(index, inicio, nome) {
  const a = index.indexOf(inicio);
  if (a < 0) throw new Error('estetica: não achei o módulo "' + nome + '" no index.html (o começo dele mudou?)');
  const b = index.indexOf('\n  /* ====', a + inicio.length);
  if (b < 0) throw new Error('estetica: não achei o fim do módulo "' + nome + '"');
  const txt = index.slice(a, b).replace(/\s+$/, '');
  /* tira só o ÚLTIMO comentário (um corpo sem outro "/*" dentro) antes de conferir */
  if (!/\}\)\(\);$/.test(txt.replace(/\/\*(?:(?!\/\*)[\s\S])*?\*\/\s*$/, '').trim()))
    throw new Error('estetica: o módulo "' + nome + '" não termina em "})();" — confira o recorte');
  return txt;
}

function gerarJs(index) {
  const fita = recorte(index, '  var Fita = (function(){', 'Fita');
  const regua = recorte(index, '  var Regua = (function(){', 'Régua');
  const calc = recorte(index, "  (function(){\n    var sl = document.getElementById('calcValor');", 'Calculadora');
  const js = `/* ==========================================================================
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

${fita}

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

${regua}

${calc}

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
`;
  try { new Function(js); } catch (e) { throw new Error('estetica: o estetica.js gerado não compila (' + e.message + ')'); }
  return js;
}

/* ------------------------------------------------------------ MARCAÇÃO ---- */

const MODOS = ['imovel', 'carro', 'maquinario'];

function marcacaoSimulador(index, params) {
  const a = index.indexOf('<section id="calculadora"');
  if (a < 0) throw new Error('estetica: não achei <section id="calculadora"> no index.html');
  const b = index.indexOf('</section>', a);
  let html = index.slice(a, b + '</section>'.length).replace(/<!--[\s\S]*?-->\n?/g, '');
  const modo = MODOS.includes(params.modo) ? params.modo : 'imovel';
  const ancora = params.form || 'simular';
  /* sem as classes de entrada coreografada da home (.rv/.stag): aqui o
     simulador aparece pronto */
  html = html.replace(/class="([^"]*)"/g, (m, c) => 'class="' + c.split(/\s+/).filter(x => x && x !== 'rv' && x !== 'stag').join(' ') + '"');
  html = html.replace('<section id="calculadora"', '<section id="calculadora" class="secao" data-modo-inicial="' + modo + '"');
  /* o botão da modalidade da página já nasce marcado */
  html = html.replace(/<button type="button" class="calc-modo-bt( ativo)?" data-modo="(\w+)" aria-pressed="(?:true|false)">/g,
    (m, at, d) => '<button type="button" class="calc-modo-bt' + (d === modo ? ' ativo' : '') + '" data-modo="' + d + '" aria-pressed="' + (d === modo) + '">');
  /* "Continuar com estes valores" leva ao formulário desta página */
  html = html.replace('href="#form-simulador"', 'href="#' + ancora + '"');
  if (!html.includes('id="calcValor"') || !html.includes('id="reguaSvg"')) throw new Error('estetica: a marcação do simulador perdeu o slider ou a régua');
  return html.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n');
}

module.exports = { gerarCss, gerarJs, marcacaoSimulador };
