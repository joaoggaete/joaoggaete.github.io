<?php
/* ============================================================================
   CONFIGURAÇÃO SÓ PARA TESTAR NO COMPUTADOR
   Usada apenas quando o atalho TESTAR-NO-COMPUTADOR define ASTRO_CONFIG —
   na hospedagem ninguém define, e o .htaccess bloqueia esta pasta.
   Banco SQLite (não precisa criar nada) e dados em teste-local/dados/.
   Para testar o painel: abra http://localhost:8080/painel/instalar.php e use
   o código de instalação abaixo.
   ========================================================================= */
return [
  'banco' => ['tipo' => 'sqlite', 'arquivo' => __DIR__ . '/dados/teste.sqlite'],
  'codigo_instalacao' => 'teste-no-computador',
  'site_url'  => 'http://localhost:8080',
  'whatsapp'  => '554599999999',
  'aviso_email' => '', 'webhook_url' => '', 'gemini_chave' => '',
  'retencao_meses' => 24,
  'ip_cabecalho' => 'REMOTE_ADDR',
];
