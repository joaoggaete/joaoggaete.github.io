#!/usr/bin/env node
/* ============================================================================
   LAYOUT COMPARTILHADO — menu, rodapé e formulário numa fonte só
   O site é HTML puro (sem build na hospedagem). Antes, cada página tinha a
   sua cópia do menu, e elas foram saindo de sincronia: quatro menus
   diferentes, links para seções que não existiam mais.
   Agora o menu e o rodapé moram em parciais/, e este script carimba a
   versão atual em todas as páginas, entre marcadores:
       <!-- #cabecalho … -->  …  <!-- /cabecalho -->
       <!-- #rodape … -->     …  <!-- /rodape -->
       <!-- #formulario modalidade=imovel … --> … <!-- /formulario -->
       <!-- #simulador modo=carro … -->     …  <!-- /simulador -->
   O HTML final continua estático (bom para Google e para quem está sem JS).

   A ESTÉTICA vem da página inicial: o fundo animado (a fita), o vidro, os
   títulos e o simulador com a régua são recortados do index.html por
   ferramentas/estetica.js e viram estetica.css + estetica.js, que as outras
   páginas carregam. O simulador das páginas (#simulador) é a MESMA marcação
   da seção #calculadora do index, com a modalidade da página já escolhida.
   Ajustou o visual ou o simulador no index? Rode este script e o resto do
   site acompanha.

   USO (na pasta do site, com Node instalado):
     node ferramentas/layout.js              atualiza todas as páginas
     node ferramentas/layout.js --verificar  só confere; sai com erro se algo
                                              estiver desatualizado
     node ferramentas/layout.js --dominio=https://www.seudominio.com.br
                                              troca o domínio em canonical,
                                              og:url, sitemap e robots
   Mudou o menu? Edite parciais/cabecalho.html e rode o comando. Nunca edite
   o menu direto numa página: a próxima rodada apaga.
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const Estetica = require('./estetica.js');

const RAIZ = path.join(__dirname, '..');
const WHATSAPP = '554599999999';

/* Toda página que recebe menu/rodapé. cta = para onde vai o botão
   "Simular meu crédito" (páginas com formulário próprio apontam para ele).
   indexar = entra no sitemap. prioridade = peso no sitemap. */
const PAGINAS = {
  'index.html':         { url: '/', cta: '#form-simulador', inicio: false, indexar: true, prioridade: '1.0' },
  'imoveis.html':       { cta: '#simular', indexar: true, prioridade: '0.9' },
  'veiculos.html':      { cta: '#simular', indexar: true, prioridade: '0.9' },
  'maquinario.html':    { cta: '#simular', indexar: true, prioridade: '0.9' },
  'exterior.html':      { indexar: true, prioridade: '0.8' },
  'videos.html':        { indexar: true, prioridade: '0.9' },
  'como-funciona.html': { indexar: true, prioridade: '0.8' },
  'lances.html':        { indexar: true, prioridade: '0.8' },
  'duvidas.html':       { indexar: true, prioridade: '0.7' },
  'simular.html':       { cta: '#simular', indexar: true, prioridade: '0.8' },
  'sobre.html':         { indexar: true, prioridade: '0.6' },
  'contato.html':       { cta: '#simular', indexar: true, prioridade: '0.6' },
  'seguranca.html':     { indexar: true, prioridade: '0.5' },
  'privacidade.html':   { indexar: true, prioridade: '0.3' },
  'agendar.html':       { indexar: false },
  '404.html':           { indexar: false },
};

const args = process.argv.slice(2);
const VERIFICAR = args.includes('--verificar');
const novoDominio = (args.find(a => a.startsWith('--dominio=')) || '').split('=')[1];

function ler(f) { return fs.readFileSync(path.join(RAIZ, f), 'utf8'); }
function parcial(nome) { return ler('parciais/' + nome + '.html').replace(/\s+$/, ''); }

/* marca o link da página atual: aria-current + classe "ativo", e o tópico
   de menu que contém a página atual ganha "contem-atual" */
function marcarAtual(html, url) {
  const alvo = 'href="' + url + '"';
  html = html.split(alvo).join(alvo + ' aria-current="page"');
  html = html.replace(/<li class="nav-drop">([\s\S]*?)<\/ul>\s*<\/li>/g, (bloco, dentro) =>
    dentro.includes('aria-current="page"') ? bloco.replace('<li class="nav-drop">', '<li class="nav-drop contem-atual">') : bloco);
  return html;
}

function montar(nome, pagina, cfg, params) {
  const url = cfg.url || '/' + pagina;
  let html = parcial(nome)
    .split('{{CTA}}').join(cfg.cta || '/simular.html')
    .split('{{WHATSAPP}}').join(WHATSAPP)
    .split('{{INICIO}}').join(cfg.inicio === false ? '' : '<a class="nav-inicio" href="/" aria-label="Página inicial"><svg class="nav-inicio-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5M6.5 9.8V20h11V9.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="nav-inicio-txt">Página inicial</span></a>');
  const padrao = { modalidade: '', canal: 'formulario' };
  const todos = Object.assign({}, padrao, params || {});
  Object.keys(todos).forEach(k => { html = html.split('{{' + k.toUpperCase() + '}}').join(todos[k]); });
  html = html.replace(/\n\s*\n(\s*<button class="tema-btn")/, '\n$1'); /* linha vazia que o {{INICIO}} deixa na home */
  if (nome !== 'formulario') html = marcarAtual(html, url);
  return html;
}

const BLOCO = /<!-- #(cabecalho|rodape|formulario|simulador)([^>]*?)-->[\s\S]*?<!-- \/\1 -->/g;

/* lido uma vez: é dele que saem a estética e o simulador das outras páginas */
const INDEX = ler('index.html');

function processar(pagina, cfg) {
  const antes = ler(pagina);
  const depois = antes.replace(BLOCO, (tudo, nome, resto) => {
    const params = {};
    resto.replace(/(\w+)=([\w-]+)/g, (m, k, v) => { params[k] = v; });
    const cabecaParams = Object.keys(params).map(k => ' ' + k + '=' + params[k]).join('');
    if (nome === 'simulador') {
      return '<!-- #simulador' + cabecaParams + ' (gerado por ferramentas/layout.js a partir da seção #calculadora do index.html — não edite aqui) -->\n' +
        Estetica.marcacaoSimulador(INDEX, params) + '\n<!-- /simulador -->';
    }
    return '<!-- #' + nome + cabecaParams + ' (gerado por ferramentas/layout.js a partir de parciais/' + nome + '.html — não edite aqui) -->\n' +
      montar(nome, pagina, cfg, params) + '\n<!-- /' + nome + ' -->';
  });
  const blocos = (antes.match(BLOCO) || []).length;
  return { antes, depois, blocos };
}

function sitemap(dominio) {
  const hoje = new Date().toISOString().slice(0, 10);
  const urls = Object.entries(PAGINAS).filter(([, c]) => c.indexar).map(([p, c]) =>
    '  <url>\n    <loc>' + dominio + (c.url || '/' + p) + '</loc>\n    <lastmod>' + hoje + '</lastmod>\n    <priority>' + c.prioridade + '</priority>\n  </url>');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
}

function dominioAtual() {
  const f = path.join(__dirname, 'dominio.txt');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : 'https://astroconsorcios.netlify.app';
}

/* ------------------------------------------------------------------ */
let desatualizadas = [];
let semMarcador = [];
for (const [pagina, cfg] of Object.entries(PAGINAS)) {
  if (!fs.existsSync(path.join(RAIZ, pagina))) { semMarcador.push(pagina + ' (arquivo não existe)'); continue; }
  const r = processar(pagina, cfg);
  if (!r.blocos) { semMarcador.push(pagina); continue; }
  if (r.antes !== r.depois) {
    desatualizadas.push(pagina);
    if (!VERIFICAR) fs.writeFileSync(path.join(RAIZ, pagina), r.depois);
  }
}

/* estetica.css e estetica.js: recortados do index a cada rodada */
for (const [arquivo, gerar] of [['estetica.css', Estetica.gerarCss], ['estetica.js', Estetica.gerarJs]]) {
  const novo = gerar(INDEX);
  const caminho = path.join(RAIZ, arquivo);
  const velho = fs.existsSync(caminho) ? fs.readFileSync(caminho, 'utf8') : '';
  if (novo !== velho) {
    desatualizadas.push(arquivo);
    if (!VERIFICAR) fs.writeFileSync(caminho, novo);
  }
}

if (novoDominio && !VERIFICAR) {
  const velho = dominioAtual();
  const novo = novoDominio.replace(/\/$/, '');
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(novo)) { console.error('Domínio inválido: use https://www.exemplo.com.br'); process.exit(1); }
  const arquivos = fs.readdirSync(RAIZ).filter(f => /\.(html|xml|txt)$/.test(f));
  for (const f of arquivos) {
    const t = ler(f);
    if (t.includes(velho)) fs.writeFileSync(path.join(RAIZ, f), t.split(velho).join(novo));
  }
  fs.writeFileSync(path.join(__dirname, 'dominio.txt'), novo + '\n');
  console.log('Domínio trocado: ' + velho + ' → ' + novo);
}

const dominio = (novoDominio || dominioAtual()).replace(/\/$/, '');
const mapa = sitemap(dominio);
const robots = 'User-agent: *\nAllow: /\nDisallow: /painel/\nDisallow: /api/\n\nSitemap: ' + dominio + '/sitemap.xml\n';
const mapaMudou = ler('sitemap.xml').replace(/<lastmod>[^<]*<\/lastmod>/g, '') !== mapa.replace(/<lastmod>[^<]*<\/lastmod>/g, '');
if (!VERIFICAR) {
  if (mapaMudou) fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'), mapa);
  fs.writeFileSync(path.join(RAIZ, 'robots.txt'), robots);
}

/* Links e arquivos quebrados: todo href/src interno (e todo 'video/…',
   'img/…' citado em script) tem que existir. Foi assim que dois vídeos do
   topo da página inicial ficaram apontando para arquivos que nunca subiram. */
function linksQuebrados() {
  const faltando = [];
  const htmls = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html'));
  for (const f of htmls) {
    const t = ler(f).replace(/<!--[\s\S]*?-->/g, '');
    const alvos = new Set();
    t.replace(/(?:href|src|poster|srcset|data-src|data-poster)="([^"#?][^"]*)"/g, (m, u) => { alvos.add(u.split(/[?#\s]/)[0]); });
    t.replace(/['"]((?:\/)?(?:video|img)\/[\w.-]+\.(?:mp4|webm|jpe?g|png|webp|svg))['"]/g, (m, u) => { alvos.add(u); });
    for (const u of alvos) {
      if (!u || /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(u) || u.includes('{{')) continue;
      if (/^\/(api|painel)\//.test(u) || u === '/api/' ) continue;
      const rel = u.replace(/^\//, '');
      const caminho = path.join(RAIZ, rel);
      const existe = fs.existsSync(caminho) || fs.existsSync(caminho + '.html') || (rel === '' ) || (fs.existsSync(caminho) && fs.statSync(caminho).isDirectory());
      if (!existe) faltando.push(f + ' → ' + u);
    }
  }
  return faltando;
}

if (semMarcador.length) console.log('Sem marcadores de layout: ' + semMarcador.join(', '));
const quebrados = linksQuebrados();
if (quebrados.length) console.error('Links/arquivos que não existem:\n  ' + quebrados.join('\n  '));
if (VERIFICAR) {
  if (desatualizadas.length || mapaMudou || quebrados.length) {
    if (desatualizadas.length || mapaMudou) console.error('Desatualizado: ' + desatualizadas.concat(mapaMudou ? ['sitemap.xml'] : []).join(', ') + '\nRode: node ferramentas/layout.js');
    process.exit(1);
  }
  console.log('Tudo em dia.');
} else {
  console.log(desatualizadas.length ? 'Atualizadas: ' + desatualizadas.join(', ') : 'Nada mudou.');
}
