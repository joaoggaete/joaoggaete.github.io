/* ============================================================================
   CONTRATOS — função serverless
   Só confere a senha de acesso ao gerador de contratos. Não guarda nada: os
   contratos são montados inteiramente no navegador de quem usa, a partir dos
   dados que a pessoa digita. Por isso não precisa do Netlify Blobs que a
   agenda usa — é só um portão de senha.
   ========================================================================= */

const cors = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-astro-contratos-senha',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store'
};
function resposta(codigo, corpo){
  return { statusCode: codigo, headers: cors, body: JSON.stringify(corpo) };
}

/* --------- limite por IP, para não virar alvo de tentativa de senha por força bruta --------- */
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

  if (!process.env.CONTRATOS_SENHA)
    return resposta(200, { ok: false,
      mensagem: 'Senha de acesso ainda não configurada. Defina a variável CONTRATOS_SENHA no painel do Netlify.' });

  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] ||
              event.headers['x-forwarded-for'] || '')).split(',')[0].trim() || 'sem-ip';
  if (demais(ip)) return resposta(429, { ok: false, mensagem: 'Muitas tentativas seguidas. Espere um minuto.' });

  const senha = event.headers && event.headers['x-astro-contratos-senha'];
  if (!senha || senha !== process.env.CONTRATOS_SENHA)
    return resposta(401, { ok: false, mensagem: 'Senha incorreta.' });

  return resposta(200, { ok: true });
};
