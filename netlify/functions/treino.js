/* ============================================================================
   TREINO DE VENDAS — função serverless
   Faz dois papéis, escolhidos por `acao`:
     - 'responder': o modelo interpreta o cliente fictício do cenário e responde
       à última mensagem do vendedor (quem pratica é sempre o usuário humano).
     - 'feedback': o modelo vira um coach e avalia a conversa inteira até agora.
     - 'dica': o modelo sussurra uma sugestão de resposta para o vendedor, sem
       isso entrar na conversa (não conta como mensagem do cliente).
   Mesma chave e mesmo provedor de IA da assistente de dúvidas (GEMINI_API_KEY),
   então não precisa configurar nada novo no Netlify além, opcionalmente, de
   TREINO_TOKEN (uma senha simples para a equipe, já que isso não é para
   visitante do site — ver /treinamento/index.html).
   ========================================================================= */
const { CENARIOS } = require('./treino-cenarios');
const { CONHECIMENTO } = require('./conhecimento');

const LIMITE_MENSAGEM = 600;
const LIMITE_HISTORICO = 24; /* turnos, não caracteres: role-play roda mais que a assistente de dúvidas */

/* --------- proteção de acesso: isto não é para visitante do site --------- */
function acessoLiberado(event) {
  const token = process.env.TREINO_TOKEN;
  if (!token) return true; /* sem token configurado, a página fica só "não listada" */
  const enviado = event.headers['x-treino-token'] || event.headers['X-Treino-Token'];
  return enviado === token;
}

/* --------- proteção de custo e abuso, mesmo padrão da duvidas.js --------- */
const balde = new Map();
const JANELA = 60000, TETO = 20;
function passouDoLimite(ip) {
  const agora = Date.now();
  const reg = balde.get(ip) || [];
  const recentes = reg.filter(function (t) { return agora - t < JANELA; });
  recentes.push(agora);
  balde.set(ip, recentes);
  if (balde.size > 500) balde.clear();
  return recentes.length > TETO;
}

/* Mesma rede de segurança da assistente de dúvidas: nenhuma promessa de prazo
   de contemplação ou link escapa, mesmo dentro do papel de personagem. */
const PROIBIDO = /(https?:|wa\.me|em at[eé] \d+ ?(meses|dias|anos)|voc[eê] ser[aá] contemplad|garant(o|imos|ido|ida)|prometo)/i;

const SAFETY = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

function promptPersonagem(cenario) {
  return [
    'Você está atuando como o CLIENTE de um treinamento de vendas por role-play, para um',
    'vendedor da Astro Consórcios praticar. Isto é uma simulação: quem escreve para você é o',
    'vendedor em treino, e ele sabe que você é uma IA representando um personagem fictício.',
    'Nunca saia do personagem, nunca dê dicas de vendas, nunca fale como assistente — você É o',
    'cliente descrito abaixo, ponto final.',
    '',
    'PERSONAGEM E CENÁRIO:',
    cenario.persona,
    '',
    'REGRAS DE COMPORTAMENTO:',
    '- Escreva como mensagem de WhatsApp real: curto (1 a 3 frases), informal, sem markdown,',
    '  sem saudação repetida a cada mensagem.',
    '- Reaja de forma realista ao que o vendedor escreve: amoleça só quando ele fizer o que o',
    '  personagem pede acima; fique mais seco/desconfiado se ele empurrar demais, inventar',
    '  número, ou pular etapa.',
    '- Você pode citar fatos sobre consórcio, mas só os que estão no MATERIAL abaixo. Se o',
    '  vendedor disser um número ou prazo que contradiz o material, ou prometer contemplação,',
    '  reaja com desconfiança dentro do personagem (ex: "tem certeza disso?", "isso é',
    '  garantido?") em vez de aceitar.',
    '- Nunca revele que isto é uma avaliação nem comente a qualidade da resposta do vendedor:',
    '  isso quem faz é o coach, em outro momento. Você só reage como o personagem reagiria.',
    '',
    'MATERIAL (o que existe de verdade sobre a Astro e consórcio, para você julgar se o',
    'vendedor está sendo preciso):',
    CONHECIMENTO
  ].join('\n');
}

function promptCoach(cenario) {
  return [
    'Você é um coach de vendas experiente, avaliando o treino de um vendedor da Astro',
    'Consórcios num cenário de role-play. Vai receber a conversa entre o VENDEDOR (em treino,',
    'humano) e o CLIENTE (personagem fictício simulado por IA) e deve avaliar só o desempenho',
    'do vendedor.',
    '',
    'CENÁRIO PRATICADO: ' + cenario.titulo + ' (produto: ' + cenario.produto + ', etapa do',
    'funil: ' + cenario.etapa + ')',
    'OBJETIVO QUE O VENDEDOR DEVIA CUMPRIR: ' + cenario.objetivo,
    '',
    'CRITÉRIOS DE AVALIAÇÃO:',
    '- Cumpriu o objetivo do cenário acima.',
    '- Usou só fatos corretos e presentes no MATERIAL abaixo (não inventou taxa, prazo de',
    '  contemplação, número ou promessa que o material não sustenta).',
    '- Nunca prometeu prazo de contemplação, resultado garantido, nem deu consultoria',
    '  financeira/fiscal/jurídica que não é papel de um vendedor da Astro.',
    '- Conduziu a conversa (perguntas certas, ouviu antes de argumentar) em vez de só empurrar.',
    '- Terminou a conversa com um próximo passo claro (não deixou solto).',
    '',
    'RESPONDA SÓ COM JSON VÁLIDO, sem texto antes ou depois, sem markdown, no formato exato:',
    '{"nota": <numero de 0 a 10>, "pontosFortes": ["..."], "pontosAMelhorar": ["..."],',
    '"fraseSugerida": "...", "resumo": "..."}',
    '- pontosFortes e pontosAMelhorar: 2 a 4 itens cada, curtos (uma frase).',
    '- fraseSugerida: uma frase melhor que o vendedor poderia ter usado no momento mais difícil',
    '  da conversa (ou "" se ele já foi bem em todos os momentos).',
    '- resumo: até 3 frases.',
    '- Se o vendedor mal conversou (poucas mensagens, saiu do assunto), diga isso com franqueza',
    '  e dê nota baixa — o objetivo é treinar de verdade, elogio fácil não ajuda ninguém.',
    '',
    'MATERIAL (o que é verdade sobre a Astro e consórcio, para você conferir precisão):',
    CONHECIMENTO
  ].join('\n');
}

function promptDica(cenario) {
  return [
    'Você é um coach de vendas ajudando um vendedor da Astro Consórcios, EM TEMPO REAL, no meio',
    'de um role-play. Ele travou e pediu uma dica rápida ("sussurro"). Olhe a conversa até agora',
    'e sugira, em até 2 frases, o que ele poderia responder agora para avançar no objetivo do',
    'cenário. Não escreva a mensagem final por inteiro pronta para copiar sem pensar — dê a ideia',
    'e o porquê, bem curto, tipo um chefe sussurrando no ouvido.',
    '',
    'CENÁRIO: ' + cenario.titulo + ' — objetivo do vendedor: ' + cenario.objetivo,
    '',
    'MATERIAL (fatos que a dica pode usar, nunca invente número fora daqui):',
    CONHECIMENTO
  ].join('\n');
}

async function chamarGemini(chave, modelo, systemInstruction, conteudos, maxTokens) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent';
  const ctrl = new AbortController();
  const relogio = setTimeout(function () { ctrl.abort(); }, 15000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: conteudos,
        generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens, topP: 0.9 },
        safetySettings: SAFETY
      }),
      signal: ctrl.signal
    });
    clearTimeout(relogio);
    if (!r.ok) {
      const detalhe = (await r.text()).slice(0, 300);
      console.error('gemini(treino) ' + r.status + ' [' + modelo + ']: ' + detalhe);
      return null;
    }
    const dados = await r.json();
    let texto = '';
    try { texto = dados.candidates[0].content.parts[0].text || ''; } catch (e) { texto = ''; }
    return texto.trim();
  } catch (e) {
    clearTimeout(relogio);
    console.error('falha na chamada (treino): ' + (e && e.message));
    return null;
  }
}

function historicoParaConteudos(historico) {
  const conteudos = [];
  historico.forEach(function (m) {
    const papel = (m && m.de === 'cliente') ? 'model' : 'user';
    const texto = String((m && m.texto) || '').slice(0, LIMITE_MENSAGEM);
    if (texto) conteudos.push({ role: papel, parts: [{ text: texto }] });
  });
  return conteudos;
}

exports.handler = async function (event) {
  const cors = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Treino-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ erro: 'metodo nao permitido' }) };
  }

  if (!acessoLiberado(event)) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ erro: 'codigo de acesso invalido' }) };
  }

  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return {
      statusCode: 200, headers: cors, body: JSON.stringify({
        erro: 'sem_chave',
        mensagem: 'O treino ainda não está ligado (falta a chave de IA no Netlify).'
      })
    };
  }

  let corpo;
  try { corpo = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers: cors, body: JSON.stringify({ erro: 'corpo invalido' }) }; }

  const cenario = CENARIOS[String(corpo.cenarioId || '')];
  if (!cenario) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ erro: 'cenario invalido' }) };
  }

  const acao = String(corpo.acao || 'responder');
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'anon';
  if (passouDoLimite(ip)) {
    return {
      statusCode: 429, headers: cors, body: JSON.stringify({
        erro: 'muitas mensagens seguidas, espere um minuto'
      })
    };
  }

  const historico = Array.isArray(corpo.historico) ? corpo.historico.slice(-LIMITE_HISTORICO) : [];
  const modelo = process.env.GEMINI_MODELO || 'gemini-3.5-flash';

  if (acao === 'responder') {
    const mensagem = String(corpo.mensagem || '').trim().slice(0, LIMITE_MENSAGEM);
    if (!mensagem) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ erro: 'mensagem vazia' }) };
    }
    const conteudos = historicoParaConteudos(historico);
    conteudos.push({ role: 'user', parts: [{ text: mensagem }] });

    let texto = await chamarGemini(chave, modelo, promptPersonagem(cenario), conteudos, 300);
    if (!texto) {
      return {
        statusCode: 200, headers: cors, body: JSON.stringify({
          resposta: '(o cliente não respondeu agora — tente de novo em alguns segundos)'
        })
      };
    }
    texto = texto.replace(/\s+/g, ' ').trim();
    if (PROIBIDO.test(texto)) {
      texto = 'Hmm, deixa eu pensar melhor nisso antes de continuar.';
    }
    return { statusCode: 200, headers: cors, body: JSON.stringify({ resposta: texto }) };
  }

  if (acao === 'dica') {
    const conteudos = historicoParaConteudos(historico);
    conteudos.push({ role: 'user', parts: [{ text: 'Me dá uma dica rápida do que responder agora.' }] });
    const texto = await chamarGemini(chave, modelo, promptDica(cenario), conteudos, 200);
    return {
      statusCode: 200, headers: cors, body: JSON.stringify({
        dica: texto ? texto.replace(/\s+/g, ' ').trim() : 'Não consegui pensar numa dica agora, tente de novo.'
      })
    };
  }

  if (acao === 'feedback') {
    if (historico.length < 2) {
      return {
        statusCode: 200, headers: cors, body: JSON.stringify({
          erro: 'conversa_curta',
          mensagem: 'Troque pelo menos algumas mensagens antes de pedir avaliação.'
        })
      };
    }
    const conteudos = historicoParaConteudos(historico);
    conteudos.push({ role: 'user', parts: [{ text: 'Avalie a conversa acima seguindo exatamente o formato JSON pedido.' }] });
    const texto = await chamarGemini(chave, modelo, promptCoach(cenario), conteudos, 900);
    if (!texto) {
      return {
        statusCode: 200, headers: cors, body: JSON.stringify({
          erro: 'falhou', mensagem: 'Não consegui avaliar agora, tente de novo em instantes.'
        })
      };
    }
    let limpo = texto.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    let avaliacao;
    try { avaliacao = JSON.parse(limpo); }
    catch (e) {
      return {
        statusCode: 200, headers: cors, body: JSON.stringify({
          erro: 'formato', mensagem: 'A avaliação veio num formato inesperado.', bruto: limpo.slice(0, 500)
        })
      };
    }
    return { statusCode: 200, headers: cors, body: JSON.stringify({ avaliacao: avaliacao }) };
  }

  return { statusCode: 400, headers: cors, body: JSON.stringify({ erro: 'acao desconhecida' }) };
};
