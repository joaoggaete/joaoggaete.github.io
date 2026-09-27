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
| `api/` | endpoints PHP: `leads.php`, `agenda.php`, `apollo.php`, `painel.php` |
| `app/` | código do servidor, configuração e dados — bloqueado para a web |
| `painel/` | painel da equipe (contatos, funil, agenda, equipe, auditoria) e instalador |
| `docs/` | [como publicar](docs/HOSPEDAGEM.md) e [estratégia, pesquisa e revisão dos vídeos](docs/ESTRATEGIA.md) |

Antes de publicar: `node ferramentas/layout.js --verificar`.
Para testar com o servidor no computador: `php -S localhost:5500 -t .`
