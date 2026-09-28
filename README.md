# Astro Consórcios — site

Site institucional e de captação da Astro Consórcios: HTML estático + um
servidor PHP pequeno (sem dependências) para pedidos de simulação, agenda de
reuniões, assistente Apollo e o painel da equipe.

| Onde | O quê |
|---|---|
| `*.html` | páginas do site |
| `nav.css`, `nav.js` | menu, busca, tema e rodapé compartilhados |
| `site.css`, `site.js` | páginas de conteúdo, formulário de simulação e vídeos |
| `parciais/` | fonte única do menu, rodapé e formulário (carimbados por `ferramentas/layout.js`) |
| `estetica.css`, `estetica.js` | **gerados do `index.html`**: fita do fundo, vidro, títulos e o simulador, usados pelas outras páginas — não edite, ajuste no index e rode `node ferramentas/layout.js` |
| `taxas.js` | taxas de referência do simulador (fonte única: home, lances e páginas de imóvel, veículo e maquinário) |
| `api/` | endpoints PHP: `leads.php`, `agenda.php`, `apollo.php`, `painel.php` |
| `app/` | código do servidor, configuração e dados — bloqueado para a web |
| `painel/` | painel da equipe (contatos, funil, agenda, equipe, auditoria) e instalador |
| `docs/` | [como publicar](docs/HOSPEDAGEM.md) e [estratégia, pesquisa e revisão dos vídeos](docs/ESTRATEGIA.md) |

## Testar no computador

- **Windows:** dois cliques em `TESTAR-NO-COMPUTADOR.bat`. **Mac:** dois cliques
  em `testar-no-mac.command` (se o Mac bloquear: botão direito → Abrir).
  O site abre em `http://localhost:8080/`. Para parar, feche a janela preta.
  - Sem PHP instalado, o atalho usa o PowerShell que já vem no Windows: páginas,
    simulador e vídeos funcionam; formulário e agenda caem no WhatsApp.
  - Com PHP instalado, o site fica completo: formulário grava, agenda e painel
    funcionam, num banco de teste em `teste-local/dados/` (que nunca sobe
    para a hospedagem). Painel: `http://localhost:8080/painel/instalar.php`,
    código de instalação `teste-no-computador`.
- **Sem servidor nenhum:** dois cliques no `index.html` também abrem o site
  (todos os caminhos são relativos). Só formulário, agenda e Apollo precisam
  de servidor.

Antes de publicar: `node ferramentas/layout.js --verificar` (confere menu,
rodapé, estética, simulador e links — inclusive caminho com "/" no começo,
que quebraria a abertura direto do disco).
