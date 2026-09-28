# Publicar o site na Hostinger (ou qualquer hospedagem com PHP + MySQL)

O site funciona em qualquer plano de hospedagem compartilhada com **PHP 8.1+ e
MySQL/MariaDB** e `.htaccess` (Apache ou LiteSpeed): Hostinger (todos os
planos de hospedagem de sites), Locaweb, HostGator, KingHost, UOL Host…
Não precisa de Node, Composer nem nada instalado no servidor.

> Esta pasta `docs/` é bloqueada pelo `.htaccess`: ninguém consegue abrir
> estes arquivos pelo navegador.

---

## 1. Antes de subir (no seu computador, com Node instalado)

```bash
node ferramentas/layout.js --dominio=https://www.seudominio.com.br   # troca o domínio em canonical, og:url, sitemap e robots
node ferramentas/layout.js --verificar                              # menu/rodapé em dia e nenhum link/vídeo quebrado
```

Rode o `--dominio` **uma vez**, quando o domínio definitivo estiver no ar.
Rode o `--verificar` **sempre** antes de publicar.

O número de WhatsApp aparece em alguns lugares. Para trocar o
`554599999999`, faça localizar-e-substituir em todos os arquivos
(`*.html`, `site.js`, `ferramentas/layout.js`, `app/config.php`) e rode
`node ferramentas/layout.js`.

## 2. No hPanel da Hostinger

1. **SSL** → Segurança → SSL → ativar (gratuito). Sem HTTPS o painel se recusa a instalar.
2. **PHP** → Avançado → Configuração do PHP → versão **8.2 ou 8.3**. Confira que
   `pdo_mysql`, `sodium`, `mbstring` e `curl` estão marcados (normalmente já vêm).
3. **Banco de dados** → Bancos de dados MySQL → criar banco + usuário.
   Anote: nome do banco, usuário e senha. O host é `localhost`.

## 2b. Testar no computador antes (opcional, recomendado)

Dois cliques em `TESTAR-NO-COMPUTADOR.bat` (Windows) ou `testar-no-mac.command`
(Mac): o site abre em `http://localhost:8080/`. Sem PHP instalado, abre as
páginas (formulário cai no WhatsApp); com PHP, o site inteiro, com painel de
teste. Detalhes no README.

## 3. Enviar os arquivos

Envie **tudo** para `public_html/` (Gerenciador de Arquivos ou FTP), **exceto**:
`.git/`, `.claude/`, `docs/`, `ferramentas/`, `parciais/`, `teste-local/`,
`TESTAR-NO-COMPUTADOR.bat` e `testar-no-mac.command` (não fazem mal lá —
estão bloqueados —, mas não servem para nada no servidor).

## 4. Configurar

1. Copie `app/config.exemplo.php` para `app/config.php`.
   *Mais seguro:* coloque-o **fora** de `public_html`, no nível de cima, com o
   nome `astro-config.php` — o site procura lá primeiro.
2. Preencha: dados do banco, `site_url`, `whatsapp` e um
   `codigo_instalacao` (uma frase longa que só você saiba).
3. Opcional: `gemini_chave` (assistente Apollo), `aviso_email` e/ou
   `webhook_url` (aviso de contato novo).

## 5. Instalar

Abra `https://www.seudominio.com.br/painel/instalar.php`:

- confere versão do PHP, extensões, HTTPS, pasta gravável e banco;
- pede o código de instalação e cria o seu usuário de **administrador**;
- gera as chaves de criptografia em `app/dados/chaves.php`.

> ⚠️ **Baixe uma cópia de `app/dados/chaves.php` e guarde fora do servidor**
> (pendrive, cofre de senhas). Sem esse arquivo, nome e telefone dos contatos
> ficam ilegíveis para sempre — é isso que os protege num vazamento do banco.

Depois disso o instalador trava sozinho.

## 6. Testar (5 minutos)

- [ ] Envie uma simulação em `/simular.html` → ela aparece em `/painel/` → Contatos.
- [ ] Marque uma reunião em `/agendar.html` → aparece em Painel → Agenda **e** em Contatos.
- [ ] Em Painel → Minha conta, **ligue a verificação em duas etapas**.
- [ ] Abra `https://www.seudominio.com.br/app/config.php` → tem que dar **403/404**.
- [ ] Se configurou o Gemini: o balão "Tirar uma dúvida" aparece na página inicial.

## 7. Equipe

Painel → Equipe → "Adicionar pessoa" com uma senha provisória (a pessoa é
obrigada a trocar no primeiro acesso). Papéis:

| Papel | Vê | Pode |
|---|---|---|
| **Administrador** | todos os contatos, auditoria | exportar planilha, gerenciar equipe, mudar a agenda |
| **Consultor** | contatos sem responsável + os dele | atender, mudar etapa, anotar, desmarcar reunião |

## 8. O que o sistema faz sozinho (LGPD)

- Nome, WhatsApp, e-mail, mensagem e anotações ficam **cifrados** no banco.
- Contato que não fechou é **anonimizado após 24 meses** (configurável em `retencao_meses`).
- Trilha de auditoria (entradas, exportações, exclusões) guardada por 12 meses, com IP parcial.
- Pedido de titular: no contato → **Exportar dados** (portabilidade) ou **Excluir dados**.

## 9. Backups

A Hostinger faz backup diário de arquivos e banco. Guarde você também, uma vez
por mês: exportação do banco (hPanel → phpMyAdmin → Exportar) **e** o
`app/dados/chaves.php` — os dois juntos. Um sem o outro não restaura os contatos.

## 10. Se algo der errado

- Erros ficam em `app/dados/logs/php-erros.log` (nunca aparecem para o visitante).
- Sem servidor PHP (ex.: abrindo o HTML no computador), os formulários continuam
  funcionando pelo WhatsApp — só não ficam registrados no painel.
- Esqueceu a senha de administrador e não há outro admin: apague
  `app/dados/instalado.lock`, rode o instalador de novo e crie outro
  administrador (os dados continuam no banco). Depois desative o usuário antigo.
