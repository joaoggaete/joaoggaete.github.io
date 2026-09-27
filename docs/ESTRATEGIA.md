# Astro Consórcios — estrutura do site, pesquisa e revisão dos vídeos

Setembro de 2026. Documento interno (a pasta `docs/` é bloqueada para a web).

## 1. A estrutura

Antes, quase tudo morava numa página inicial de 570 KB, e as outras páginas
tinham quatro versões diferentes de menu. Agora o site é organizado pela
**jornada de decisão**: cada visitante cai onde a pergunta dele é respondida e
termina no mesmo lugar — a simulação.

```
Início (/)                      vitrine: vídeo, simulador de custo, formulário em 3 passos
├── Soluções
│   ├── /imoveis                compra, construção, reforma, quitação · FGTS · INCC · até 30% embutido
│   ├── /veiculos               passeio, premium, motos, náuticos, frotas · troca de chaves
│   ├── /maquinario             agro e indústria · capital de giro
│   └── /exterior               brasileiros que ganham em outra moeda
├── ▶ Vídeos (/videos)          10 vídeos em trilha: entenda → por que a Astro → formas de usar
├── Aprenda
│   ├── /como-funciona          o método (grupo, lance, acompanhamento) + prazos
│   ├── /lances                 sorteio, lance fixo, lance livre + simulador
│   ├── /duvidas                18 perguntas em 5 grupos (FAQ com marcação para o Google)
│   └── /seguranca              Banco Central, contrato, para onde vai o dinheiro
├── Simuladores                 custo total (/#calculadora) · lance · prazo
├── A Astro
│   ├── /sobre                  posicionamento: consórcio estratégico, compromissos
│   ├── /contato                WhatsApp · vídeo · escritório em Cascavel (mapa)
│   └── /agendar                agenda de reunião por vídeo
└── Simular meu crédito (/simular)   ← botão fixo em todas as páginas, no topo e no celular
```

**Um só botão principal em todo o site: "Simular meu crédito".** Antes eram
seis textos diferentes ("Planejar minha conquista", "Quero pagar menos juros",
"Ver quanto vou economizar"…) levando a lugares diferentes.

### O funil, de ponta a ponta

1. **Entrada** — anúncio, Google ou indicação chega numa página de solução
   (`/imoveis?utm_source=meta&utm_campaign=…`) ou num vídeo.
2. **Convencimento** — números-chave, usos reais, vídeo de 12–42 s com
   chamada ao final, o método em 4 passos, perguntas frequentes do segmento.
3. **Conversão** — formulário curto na própria página, com a modalidade já
   marcada. O pedido é **gravado no servidor antes** de o WhatsApp abrir.
4. **Atendimento** — painel `/painel/`: cada contato com origem (campanha,
   anúncio, página), etapa (novo → contato → simulação → reunião → proposta →
   fechado/perdido), responsável, anotações e botão de WhatsApp com mensagem
   pronta.
5. **Medição** — aba Funil: conversão, de onde vieram, qual página converte.

### Como marcar os anúncios (para o painel mostrar qual vende)

Use sempre os parâmetros `utm_` no link do anúncio:

```
https://www.seudominio.com.br/imoveis?utm_source=meta&utm_medium=cpc&utm_campaign=imoveis-set26&utm_content=video-renda
```

Dá também para abrir o formulário já preenchido: `/simular?modalidade=carro`
ou `/simular?para=exterior`.

## 2. Pesquisa de mercado

### Mercado

- 2025: **5,16 milhões de cotas vendidas (+15%)** e **R$ 500,27 bilhões em
  créditos comercializados (+32,1%)**; **12,94 milhões de participantes ativos
  em abril/2026 (+11,6%, recorde)** — dados da ABAC.
- O consórcio avança entre investidores de **alta renda**, usado para
  planejamento patrimonial, liquidez e custo de oportunidade (manter o capital
  aplicado); grandes plataformas de investimento já o incluem no portfólio.
  É exatamente o posicionamento "consórcio estratégico" da Astro.

### O que as grandes administradoras fazem no site

| | Embracon | Ademicon | O que a Astro adotou |
|---|---|---|---|
| Menu | A Embracon · O Consórcio · Central de Ajuda · Blog · 2ª via · Cliente | Início · Blog · A Ademicon · Produtos · Área do cliente | Soluções · Vídeos · Aprenda · Simuladores · A Astro |
| Chamada | "Simular agora" repetido em toda a página | "Simular Agora" fixo no menu | "Simular meu crédito" fixo no menu, no rodapé e no celular |
| Captação | simulador por produto, sem barreira | simulador segmentado por produto | formulário curto por segmento, modalidade já marcada |
| Confiança | nº de autorização do Banco Central, volume (bens entregues, clientes), depoimentos | Banco Central, auditoria, ABAC, balanços publicados | Lei 11.795, Banco Central, "nenhum pagamento passa pela Astro", simulação por escrito |

**Onde a Astro não deve competir:** volume ("+600 mil bens entregues"). Uma
consultoria não tem esses números e inventá-los seria o pior erro possível.
**Onde a Astro ganha:** método (histórico do grupo + estratégia de lance +
acompanhamento), transparência (custos e riscos por escrito, sem promessa de
prazo) e atendimento humano — exatamente o que o site agora destaca.

**Maior lacuna restante: prova social real.** As duas administradoras usam
depoimentos. O site tem as seções de cases e depoimentos desligadas
(comentadas no `index.html`) até existirem clientes reais com autorização de
imagem. Prioridade comercial nº 1 assim que houver as primeiras contemplações.

### Hospedagem

- Hostinger: **PHP + MySQL em todos os planos** de hospedagem de sites; Node.js
  só no plano Unlimited e na Cloud. Por isso o servidor foi escrito em **PHP
  puro** — roda em qualquer plano e em qualquer outra hospedagem brasileira,
  sem instalar nada.
- SSL grátis, backups diários e CDN estão incluídos nos planos.

### Segurança e dados pessoais (LGPD)

Referências: Guia Orientativo de Segurança da Informação para Agentes de
Tratamento de Pequeno Porte (ANPD) e OWASP Password Storage Cheat Sheet.

| Exigência / boa prática | Como ficou |
|---|---|
| Controle de acesso por função | usuários individuais; papéis administrador e consultor; consultor só vê os contatos dele e os sem dono |
| Senhas fortes e bem guardadas | mínimo 12 caracteres, lista de senhas óbvias; **Argon2id** (ou bcrypt custo 12) + "pimenta" guardada fora do banco — acima do mínimo da OWASP |
| Autenticação multifator | verificação em duas etapas (Google/Microsoft Authenticator), com proteção contra reuso do código |
| Força bruta | bloqueio após 5 erros, com tempo dobrando até 24 h; limite por IP; mesma mensagem para e-mail existente ou não |
| Criptografia | HTTPS obrigatório + **dados pessoais cifrados no banco** (libsodium); chave em arquivo separado |
| Sessão | cookie Secure/HttpOnly/SameSite=Strict; expira com 30 min parado ou 10 h; token CSRF em toda ação |
| Registro de acesso | trilha de auditoria (entradas, exportações, exclusões, mudanças), 12 meses, IP parcial |
| Minimização | aviso por e-mail/webhook **sem** nome e telefone; formulário pede só o necessário |
| Retenção | contato que não fechou é anonimizado após 24 meses, automaticamente |
| Direitos do titular | exportar (portabilidade) e excluir dados pelo painel |
| Atualização e backups | PHP atualizado pelo hPanel; backup do banco + `chaves.php` (ver `HOSPEDAGEM.md`) |

**Antes de publicar, na Política de Privacidade:** preencha o **CNPJ** e o
**e-mail de contato** — hoje estão como `[•]` e `[e-mail de contato]`. O
número `(45) 99999-9999` também parece provisório.

Sobre **área do cliente** (consorciado acompanhar a própria cota): as
administradoras já oferecem portal próprio com boleto e extrato. Recomendação:
não duplicar isso agora; a base (usuários, senha forte, 2FA, criptografia,
auditoria) está pronta para crescer para isso se um dia fizer sentido.

## 3. Revisão dos vídeos

Os 10 vídeos são curtos (12–42 s), narrados, com legenda gravada na imagem
(bom para assistir sem som) e visual consistente. O roteiro de cada um foi
transcrito e está publicado em `/videos` (acessibilidade e Google).

| Vídeo | Duração | Onde está | Avaliação |
|---|---|---|---|
| 1 · O que é consórcio | 36 s | home, /videos, /veiculos | Excelente. Já diz "sem lance depende de sorteio; o prazo varia". Manter. |
| 8 · Grupo e lance | 25 s | /como-funciona, /lances, /videos, /maquinario | Bom. "Hora certa de retirar o lance livre" é jargão — ver ajustes. |
| 9 · Diferencial | 32 s | home, /sobre, /videos | Bom. "Pra você não pagar a mais" pode soar como promessa. |
| 10 · Atendimento | 42 s | home, /contato, /videos | Bom e completo; o mais longo. |
| 3 · Trocar o financiamento | 17 s | home, /imoveis, /videos | Ótimo gancho para anúncio de imóveis. |
| 2 · Dinheiro rendendo | 17 s | home, 3 páginas de solução, /videos | Ótimo para alta renda. |
| 4 · Trocar de carro | 12 s | home, /veiculos, /videos | Curto demais para explicar o mecanismo; ver ajustes. |
| 5 · Imóvel para renda | 19 s | home, /imoveis, /videos | Ótimo: cita risco de vacância com honestidade. |
| 6 · Cota com ágio | 22 s | home, /videos | Bom; ressalvas corretas (ágio varia, administradora aprova). |
| 7 · Capital de giro | 20 s | home, /maquinario, /videos | **Explica diferente do texto do site** — ver ajustes. |

### Ajustes recomendados (se for renderizar de novo)

1. **Capital de giro (v7).** O vídeo fala em "comprar um bem que gera receita
   ou negociar a carta"; o texto da página inicial descreve outro mecanismo
   (a pessoa física compra, com a carta, um bem da própria empresa). Escolher
   uma explicação, validar com a administradora/jurídico e alinhar vídeo e texto.
2. **Troca de carro (v4).** "Usar seu carro atual como parte do lance" é
   impreciso: o lance é em dinheiro ou embutido. Sugestão: *"o valor do seu
   carro atual ajuda a compor o lance"* + *"conforme as regras da administradora"*.
3. **Grupo e lance (v8) e Diferencial (v9).** Trocar "a hora certa de
   retirar/liberar o lance livre" por algo como *"acompanhamos cada assembleia
   para decidir se vale manter ou ajustar o lance"*, e tirar "pra você não
   pagar a mais".
4. **Arquivos faltando.** A página inicial apontava para
   `astro-v9-diferenciais-v4.mp4` e `astro-v10-v3.mp4` (e capas
   `video9-capa-v3.jpg`, `video10-capa-v2.jpg`), que **não estão no
   repositório** — os dois vídeos davam erro. Foram religados às versões que
   existem (v3 e v2). Se as versões novas estão no seu computador, suba os
   arquivos e troque os nomes em `index.html` e `videos.html`.
5. **Formato.** Todos são 16:9. Para Reels, Stories, Shorts e WhatsApp Status,
   renderizar versões **9:16** (o layout do Apollo com legenda embaixo se adapta bem).
6. **Final.** Todos terminam em "Chama a gente no WhatsApp". Para anúncio,
   testar uma versão terminando em *"Simule no site"* + endereço curto.

### Vídeos que faltam (em ordem de impacto na venda)

1. **"Pra onde vai o meu dinheiro?"** — Banco Central, contrato com a
   administradora, nenhum pagamento passa pela Astro. É a objeção nº 1 de quem
   nunca fez consórcio (a página `/seguranca` existe, falta o vídeo).
2. **Lance embutido em 30 segundos** — o conceito mais perguntado e o mais
   mal-entendido ("não existe lance grátis").
3. **Maquinário e agro** — carta planejada para a safra, sem comparar com
   crédito rural (as linhas variam demais).
4. **Brasileiros no exterior** — câmbio a favor, tudo à distância.
5. **Como é a contratação** — as 6 etapas da página Como funciona.
6. **Depoimento real** de cliente contemplado (com autorização) — a prova
   social que falta.

## 4. Próximos passos

1. Domínio definitivo + SSL + instalação (ver `HOSPEDAGEM.md`).
2. Preencher CNPJ, e-mail e WhatsApp reais (Política de Privacidade e config).
3. Ligar Pixel da Meta e Google Analytics (os blocos já estão no `index.html`,
   comentados; a medição só liga com o "Aceitar" do aviso de cookies).
4. Perfil da empresa no Google (Cascavel) apontando para `/contato`.
5. Campanhas por segmento apontando para `/imoveis`, `/veiculos`,
   `/maquinario`, `/exterior`, sempre com `utm_`.
6. Gravar os vídeos da lista acima; publicar depoimentos quando houver.

### Fontes

- ABAC via [Estado de Minas, set/2026 — "Consórcio avança entre investidores de alta renda"](https://www.em.com.br/mundo-corporativo/2026/09/7506926-consorcio-avanca-entre-investidores-de-alta-renda.html)
- [Embracon](https://www.embracon.com.br/) e [Ademicon](https://www.ademicon.com.br/) — estrutura dos sites consultada em set/2026
- [Hostinger — hospedagem de aplicações Node.js](https://www.hostinger.com/web-apps-hosting) e [parâmetros e limites dos planos](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans-in-hostinger/)
- [ANPD — Guia orientativo de segurança da informação para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte)
- [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Banco Central — ranking de administradoras de consórcio](https://www3.bcb.gov.br/ranking/consorcio.do)
