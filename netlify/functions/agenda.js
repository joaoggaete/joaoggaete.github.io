/* ============================================================================
   AGENDA — função serverless
   Guarda a disponibilidade e as reuniões marcadas no Netlify Blobs, falando
   com ele por HTTP puro. NADA de npm: o João publica arrastando a pasta, e
   deploy arrastado não roda `npm install`. Uma função com dependência
   simplesmente não subiria.
   O formato da URL do Blobs veio do código do @netlify/blobs 11.0.3:
     {edgeURL}/{siteID}/{store}/{chave}   com  authorization: Bearer {token}
   ========================================================================= */

/* O cliente oficial @netlify/blobs transforma todo armazenamento permanente
   em `site:<nome>` antes de chamar a API. Como esta função fala com a API
   diretamente, precisamos aplicar o mesmo prefixo aqui. Sem ele, a API recebe
   um namespace inválido e pode responder 401 mesmo com token e Project ID
   corretos. */
const LOJA = 'site:astro-agenda';
const CHAVE_CONFIG = 'config';
const ZONA = 'America/Sao_Paulo';   /* o Brasil não tem horário de verão desde
                                       2019, então -03:00 é estável o ano todo */
const OFFSET = '-03:00';

const CONFIG_PADRAO = {
  duracao: 50,            /* minutos por reunião: cabe na "uma hora" do cliente */
  intervalo: 10,          /* folga entre uma e outra: o passo fecha em 60 min */
  antecedencia: 4,        /* horas mínimas para marcar */
  janela: 21,             /* quantos dias à frente aparecem */
  semana: {               /* 0 = domingo */
    1: [['09:00','12:00'], ['14:00','18:00']],
    2: [['09:00','12:00'], ['14:00','18:00']],
    3: [['09:00','12:00'], ['14:00','18:00']],
    4: [['09:00','12:00'], ['14:00','18:00']],
    5: [['09:00','12:00'], ['14:00','17:00']]
  },
  bloqueios: [],          /* datas YYYY-MM-DD inteiras */
  sala: ''                /* link fixo de reunião; vazio = gera um por reunião */
};

/* --------- armazenamento: Blobs em produção, arquivo no meu emulador --------- */
function contextoBlobs(){
  /* 1º: o contexto que o Netlify injeta sozinho. Em deploy por Git ele vem;
     em deploy arrastado NÃO veio, e foi por isso que a agenda não abriu. */
  const bruto = process.env.NETLIFY_BLOBS_CONTEXT;
  if (bruto) {
    try {
      const c = JSON.parse(Buffer.from(bruto, 'base64').toString('utf8'));
      if (c && c.token && c.siteID) { c.origem = 'contexto'; return c; }
    } catch (e) {}
  }
  /* 2º: credencial própria, que funciona em qualquer tipo de deploy */
  if (process.env.NETLIFY_TOKEN && process.env.NETLIFY_SITE_ID) {
    return { origem: 'token', apiURL: 'https://api.netlify.com',
             token: process.env.NETLIFY_TOKEN, siteID: process.env.NETLIFY_SITE_ID };
  }
  return null;
}

const ACEITA_ASSINADA = 'application/json;type=signed-url';

/* pede a url assinada e devolve ela; é o caminho da API, sem edgeURL */
async function urlAssinada(c, chave, metodo){
  const u = (c.apiURL || 'https://api.netlify.com').replace(/\/$/, '') +
    '/api/v1/blobs/' + c.siteID + '/' + LOJA + '/' + encodeURIComponent(chave);
  const r = await fetch(u, {
    method: metodo,
    headers: { authorization: 'Bearer ' + c.token, accept: ACEITA_ASSINADA }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('blobs api ' + r.status);
  const j = await r.json();
  return j && j.url;
}

function urlBlob(c, chave){
  /* uncachedEdgeURL dá leitura forte: sem ela, dois visitantes podem ver o
     mesmo horário livre por causa de cache */
  const base = c.uncachedEdgeURL || c.edgeURL;
  if (!base || !c.siteID) return null;
  return base.replace(/\/$/, '') + '/' + c.siteID + '/' + LOJA + '/' + encodeURIComponent(chave);
}

async function ler(chave){
  if (process.env.AGENDA_LOCAL) {
    const fs = require('fs'), p = require('path');
    const f = p.join(process.env.AGENDA_LOCAL, chave.replace(/[^\w-]/g, '_') + '.json');
    if (!fs.existsSync(f)) return null;
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; }
  }
  const c = contextoBlobs();
  if (!c) return null;
  let r;
  if (c.origem === 'token') {
    const assinada = await urlAssinada(c, chave, 'GET');
    if (!assinada) return null;
    r = await fetch(assinada);
  } else {
    const u = urlBlob(c, chave);
    if (!u) return null;
    r = await fetch(u, { headers: { authorization: 'Bearer ' + c.token } });
  }
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('blobs leitura ' + r.status);
  const t = await r.text();
  if (!t) return null;
  try { return JSON.parse(t); } catch (e) { return null; }
}

async function gravar(chave, valor){
  if (process.env.AGENDA_LOCAL) {
    const fs = require('fs'), p = require('path');
    fs.mkdirSync(process.env.AGENDA_LOCAL, { recursive: true });
    fs.writeFileSync(p.join(process.env.AGENDA_LOCAL, chave.replace(/[^\w-]/g, '_') + '.json'),
                     JSON.stringify(valor));
    return true;
  }
  const c = contextoBlobs();
  if (!c) throw new Error('sem armazenamento');
  const corpo = JSON.stringify(valor);
  let r;
  if (c.origem === 'token') {
    const assinada = await urlAssinada(c, chave, 'PUT');
    if (!assinada) throw new Error('sem url assinada');
    r = await fetch(assinada, { method: 'PUT', body: corpo });
  } else {
    const u = urlBlob(c, chave);
    if (!u) throw new Error('sem armazenamento');
    r = await fetch(u, {
      method: 'PUT',
      headers: { authorization: 'Bearer ' + c.token, 'content-type': 'application/json' },
      body: corpo
    });
  }
  if (!r.ok) throw new Error('blobs gravacao ' + r.status);
  return true;
}

/* --------- datas, tudo em horário de Brasília --------- */
function doisDig(n){ return (n < 10 ? '0' : '') + n; }

/* "agora" em São Paulo, como {ano,mes,dia,hora,min} */
function agoraSP(){
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hour12:false
  }).formatToParts(new Date());
  const p = {};
  f.forEach(function(x){ p[x.type] = x.value; });
  return { data: p.year + '-' + p.month + '-' + p.day,
           minutos: (+p.hour) * 60 + (+p.minute) };
}

function somaDias(data, n){
  const d = new Date(data + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function diaDaSemana(data){ return new Date(data + 'T12:00:00Z').getUTCDay(); }
function paraMinutos(hhmm){
  const p = String(hhmm).split(':');
  return (+p[0]) * 60 + (+p[1] || 0);
}
function paraHora(min){ return doisDig(Math.floor(min/60)) + ':' + doisDig(min % 60); }
function mesDe(data){ return String(data).slice(0, 7); }

/* --------- os horários que ainda estão livres --------- */
function gerarSlots(cfg, dia){
  const faixas = (cfg.semana || {})[String(diaDaSemana(dia))] || [];
  const passo = (+cfg.duracao || 45) + (+cfg.intervalo || 0);
  const out = [];
  faixas.forEach(function(f){
    const ini = paraMinutos(f[0]), fim = paraMinutos(f[1]);
    for (let m = ini; m + (+cfg.duracao || 45) <= fim; m += passo) out.push(paraHora(m));
  });
  return out;
}

async function reservasDoMes(mes){
  const r = await ler('reservas-' + mes);
  return Array.isArray(r) ? r : [];
}

async function horariosLivres(cfg){
  const agora = agoraSP();
  const limite = agora.minutos + (+cfg.antecedencia || 0) * 60;
  const dias = [];
  const meses = {};
  for (let i = 0; i <= (+cfg.janela || 21); i++){
    const dia = somaDias(agora.data, i);
    if ((cfg.bloqueios || []).indexOf(dia) >= 0) continue;
    const m = mesDe(dia);
    if (!meses[m]) meses[m] = await reservasDoMes(m);
    const tomados = {};
    meses[m].forEach(function(r){ if (r.dia === dia && !r.cancelada) tomados[r.hora] = 1; });

    const livres = gerarSlots(cfg, dia).filter(function(h){
      if (tomados[h]) return false;
      if (i === 0 && paraMinutos(h) < limite) return false;
      if (i === 1 && limite > 24*60 && paraMinutos(h) + 24*60 < limite) return false;
      return true;
    });
    if (livres.length) dias.push({ dia: dia, horas: livres });
  }
  return dias;
}

/* --------- respostas --------- */
const cors = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-astro-senha',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store'
};
function resposta(codigo, corpo){
  return { statusCode: codigo, headers: cors, body: JSON.stringify(corpo) };
}

function limpo(s, max){
  return String(s == null ? '' : s).replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, max);
}
function soDigitos(s){ return String(s || '').replace(/\D/g, ''); }

function id(){
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

/* --------- limite por IP, para não virar alvo de robô --------- */
const balde = new Map();
function demais(ip){
  const agora = Date.now(), janela = 60000, teto = 12;
  const lista = (balde.get(ip) || []).filter(function(t){ return agora - t < janela; });
  lista.push(agora);
  balde.set(ip, lista);
  if (balde.size > 500) balde.clear();
  return lista.length > teto;
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] ||
              event.headers['x-forwarded-for'] || '')).split(',')[0].trim() || 'sem-ip';
  const q = event.queryStringParameters || {};
  let corpo = {};
  if (event.body) { try { corpo = JSON.parse(event.body); } catch (e) { corpo = {}; } }
  const acao = limpo(q.acao || corpo.acao, 20);

  /* diagnóstico público de propósito: só diz SE existe credencial e o que o
     armazenamento respondeu. Nenhum valor de chave, token ou id sai daqui. */
  if (acao === 'diagnostico') {
    const c = contextoBlobs();
    const r = { versao: 'agenda-blobs-site-v2',
                contextoInjetado: !!process.env.NETLIFY_BLOBS_CONTEXT,
                tokenProprio: !!process.env.NETLIFY_TOKEN,
                siteIdProprio: !!process.env.NETLIFY_SITE_ID,
                senhaDefinida: !!process.env.AGENDA_SENHA,
                origem: c ? c.origem : 'nenhuma',
                campos: c ? Object.keys(c).sort() : [] };
    if (c) {
      try { await ler('teste-de-conexao'); r.leitura = 'ok'; }
      catch (e) { r.leitura = String(e && e.message).slice(0, 90); }
      try { await gravar('teste-de-conexao', { quando: new Date().toISOString() });
            r.gravacao = 'ok'; }
      catch (e) { r.gravacao = String(e && e.message).slice(0, 90); }
    }
    return resposta(200, r);
  }
  const admin = event.headers &&
    event.headers['x-astro-senha'] &&
    process.env.AGENDA_SENHA &&
    event.headers['x-astro-senha'] === process.env.AGENDA_SENHA;

  /* sem armazenamento configurado a página cai para o WhatsApp em vez de
     prometer um agendamento que não vai existir */
  const temArmazenamento = !!(process.env.AGENDA_LOCAL || contextoBlobs());
  if (!temArmazenamento) {
    return resposta(200, { ok: false, motivo: 'sem-armazenamento',
      mensagem: 'O agendamento ainda não está ligado. Fale com a gente no WhatsApp.' });
  }

  try {
    const cfg = Object.assign({}, CONFIG_PADRAO, (await ler(CHAVE_CONFIG)) || {});

    /* ---------------- público ---------------- */
    if (acao === 'horarios') {
      return resposta(200, { ok: true, zona: ZONA, offset: OFFSET,
        duracao: cfg.duracao, dias: await horariosLivres(cfg) });
    }

    if (acao === 'marcar') {
      if (demais(ip)) return resposta(429, { ok: false, mensagem: 'Muitas tentativas seguidas. Espere um minuto.' });

      const dia = limpo(corpo.dia, 10), hora = limpo(corpo.hora, 5);
      const nome = limpo(corpo.nome, 80);
      const zap = soDigitos(corpo.whatsapp).slice(0, 15);
      const assunto = limpo(corpo.assunto, 300);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || !/^\d{2}:\d{2}$/.test(hora))
        return resposta(400, { ok: false, mensagem: 'Data ou horário inválidos.' });
      if (nome.length < 2) return resposta(400, { ok: false, mensagem: 'Escreva seu nome.' });
      if (zap.length < 10) return resposta(400, { ok: false, mensagem: 'Escreva um WhatsApp com DDD.' });

      /* o horário tem que estar entre os que a agenda realmente oferece */
      const livres = await horariosLivres(cfg);
      const doDia = livres.filter(function(d){ return d.dia === dia; })[0];
      if (!doDia || doDia.horas.indexOf(hora) < 0)
        return resposta(409, { ok: false, mensagem: 'Esse horário acabou de sair da agenda. Escolha outro.' });

      const mes = mesDe(dia);
      const lista = await reservasDoMes(mes);
      if (lista.some(function(r){ return r.dia === dia && r.hora === hora && !r.cancelada; }))
        return resposta(409, { ok: false, mensagem: 'Esse horário acabou de ser tomado. Escolha outro.' });

      const reserva = {
        id: id(), dia: dia, hora: hora, nome: nome, whatsapp: zap, assunto: assunto,
        sala: cfg.sala || ('https://meet.jit.si/astro-' + id()),
        criada: new Date().toISOString(), cancelada: false
      };
      lista.push(reserva);
      await gravar('reservas-' + mes, lista);

      /* confere que gravou mesmo: duas marcações no mesmo instante poderiam
         se sobrescrever, e é melhor descobrir agora do que no dia */
      const confere = await reservasDoMes(mes);
      if (!confere.some(function(r){ return r.id === reserva.id; }))
        return resposta(409, { ok: false, mensagem: 'Não consegui confirmar. Tente de novo.' });

      return resposta(200, { ok: true, reserva: reserva, zona: ZONA, offset: OFFSET });
    }

    /* ---------------- do João ---------------- */
    if (!admin) return resposta(401, { ok: false, mensagem: 'Senha da agenda incorreta.' });

    if (acao === 'config' && event.httpMethod === 'GET')
      return resposta(200, { ok: true, config: cfg });

    if (acao === 'config') {
      const c = corpo.config || {};
      const nova = {
        duracao: Math.max(15, Math.min(240, +c.duracao || 45)),
        intervalo: Math.max(0, Math.min(120, +c.intervalo || 0)),
        antecedencia: Math.max(0, Math.min(168, +c.antecedencia || 0)),
        janela: Math.max(1, Math.min(90, +c.janela || 21)),
        semana: {}, bloqueios: [], sala: limpo(c.sala, 200)
      };
      for (let d = 0; d <= 6; d++){
        const faixas = (c.semana || {})[String(d)];
        if (!Array.isArray(faixas)) continue;
        const boas = faixas
          .filter(function(f){ return Array.isArray(f) && /^\d{2}:\d{2}$/.test(f[0]) && /^\d{2}:\d{2}$/.test(f[1]); })
          .filter(function(f){ return paraMinutos(f[1]) > paraMinutos(f[0]); })
          .slice(0, 6);
        if (boas.length) nova.semana[String(d)] = boas;
      }
      nova.bloqueios = (Array.isArray(c.bloqueios) ? c.bloqueios : [])
        .filter(function(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d); }).slice(0, 200);
      await gravar(CHAVE_CONFIG, nova);
      return resposta(200, { ok: true, config: nova });
    }

    if (acao === 'agenda') {
      const agora = agoraSP();
      const meses = {};
      const tudo = [];
      for (let i = -30; i <= (+cfg.janela || 21) + 1; i++){
        const m = mesDe(somaDias(agora.data, i));
        if (meses[m]) continue;
        meses[m] = 1;
        (await reservasDoMes(m)).forEach(function(r){ tudo.push(r); });
      }
      tudo.sort(function(a, b){ return (a.dia + a.hora) < (b.dia + b.hora) ? -1 : 1; });
      return resposta(200, { ok: true, reservas: tudo, hoje: agora.data, zona: ZONA });
    }

    if (acao === 'cancelar') {
      const alvo = limpo(corpo.id, 20);
      const mes = mesDe(limpo(corpo.dia, 10));
      const lista = await reservasDoMes(mes);
      let achou = false;
      lista.forEach(function(r){ if (r.id === alvo){ r.cancelada = true; achou = true; } });
      if (!achou) return resposta(404, { ok: false, mensagem: 'Reunião não encontrada.' });
      await gravar('reservas-' + mes, lista);
      return resposta(200, { ok: true });
    }

    return resposta(400, { ok: false, mensagem: 'Ação desconhecida.' });

  } catch (e) {
    console.error('agenda: ' + (e && e.message));
    return resposta(200, { ok: false, motivo: 'falha',
      mensagem: 'Não consegui abrir a agenda agora. Fale com a gente no WhatsApp.' });
  }
};
