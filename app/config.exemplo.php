<?php
/* ============================================================================
   CONFIGURAÇÃO DO SERVIDOR — MODELO
   1. Copie este arquivo para  app/config.php  (mesma pasta).
      Melhor ainda: para FORA da pasta pública, no mesmo nível de
      public_html, com o nome  astro-config.php  — o site procura lá primeiro.
   2. Preencha os dados do banco que você criou no hPanel da Hostinger
      (Bancos de dados → Gerenciamento). O host na Hostinger é "localhost".
   3. Invente um código de instalação e abra  https://SEU-SITE/painel/instalar.php
   config.php NUNCA vai para o Git (está no .gitignore): tem senha de banco.
   ========================================================================= */
return [

  /* ---------------- banco de dados ---------------- */
  /* 'mysql' na hospedagem. 'sqlite' dispensa criar banco (bom para testar
     no computador); o arquivo fica em app/dados/, bloqueado para a web. */
  'banco' => [
    'tipo'    => 'mysql',
    'host'    => 'localhost',
    'porta'   => 3306,
    'nome'    => 'u123456789_astro',
    'usuario' => 'u123456789_astro',
    'senha'   => 'TROQUE-PELA-SENHA-DO-BANCO',
  ],

  /* ---------------- instalação ---------------- */
  /* Qualquer frase longa que só você saiba. É pedida UMA vez, em
     /painel/instalar.php, para criar o primeiro usuário administrador.
     Depois da instalação ela não serve para mais nada. */
  'codigo_instalacao' => 'TROQUE-POR-UMA-FRASE-LONGA-SO-SUA',

  /* ---------------- site ---------------- */
  'site_url'  => 'https://www.seudominio.com.br',   /* sem barra no fim */
  'whatsapp'  => '554599999999',                     /* só dígitos, com 55 */

  /* ---------------- avisos de novo contato (opcionais) ---------------- */
  /* E-mail que recebe o aviso "chegou pedido novo". O aviso NÃO leva nome
     nem telefone — só modalidade/faixa e o link do painel. Dado pessoal
     fica no painel, atrás de senha. Deixe '' para desligar. */
  'aviso_email'     => '',
  'aviso_remetente' => 'site@seudominio.com.br',     /* caixa do seu domínio */
  /* Webhook (Make, Zapier, n8n, Slack…). Mesmo cuidado: sem dado pessoal,
     a não ser que 'webhook_com_dados' seja true. */
  'webhook_url'       => '',
  'webhook_com_dados' => false,

  /* ---------------- Apollo (assistente de dúvidas) ---------------- */
  /* Chave da API Gemini (Google AI Studio). Vazia = o Apollo responde que
     ainda não está ligado e manda para o WhatsApp. */
  'gemini_chave'  => '',
  'gemini_modelo' => 'gemini-3.5-flash',

  /* ---------------- privacidade ---------------- */
  /* Contato que não virou cliente é anonimizado depois deste prazo
     (a Política de Privacidade promete 24 meses). */
  'retencao_meses' => 24,

  /* ---------------- rede ---------------- */
  /* Só mude se o site ficar atrás de um proxy/CDN que esconda o IP real
     do visitante (ex.: Cloudflare → 'HTTP_CF_CONNECTING_IP'). Um cabeçalho
     errado aqui deixa qualquer um burlar o limite de tentativas. */
  'ip_cabecalho' => 'REMOTE_ADDR',
];
