# GUIA DE PRODUÇÃO — Série de vídeos explicativos da Astro Consórcios (renderização 2)

> Este guia vale para os 10 vídeos. Cada prompt de vídeo = este guia + a
> especificação do vídeo (arquivos `docs/videos/vNN-*.md`). Leia os dois
> inteiros antes de começar.

## 0. Quem você é nesta tarefa e o que entregar

Você é a equipe de produção (roteiro, direção de arte, animação, som e
finalização) de um vídeo explicativo da **Astro Consórcios**, uma consultoria
e representação de consórcios de Cascavel/PR que atende o Brasil inteiro e
brasileiros no exterior. Vai produzir **um vídeo** (o descrito na
especificação), renderizado **no computador do João** (Windows, GPU AMD
Radeon **RX 9070 XT**, 16 GB).

Entregue, para o vídeo:
1. `astro-vN-SLUG-r2.mp4` — 1920×1080, 30 fps (versão do site).
2. `astro-vN-SLUG-r2-9x16.mp4` — 1080×1920, 30 fps (Reels, Shorts, Stories, Status).
3. `astro-vN-SLUG-r2.pt-BR.vtt` — legendas em arquivo (acessibilidade e Google).
4. `videoN-capa-r2.jpg` (1920×1080, qualidade 85) e `videoN-capa-r2.webp` (qualidade 80).
5. `relatorio-vN.md` — roteiro final como foi gravado, duração, loudness
   medido, tamanho dos arquivos, **licença da voz e da música** (com link ou
   comprovante) e qualquer desvio desta especificação, com o motivo.

Os nomes são **novos de propósito** (`-r2`): o site guarda vídeo em cache por
um ano, e reaproveitar o nome antigo faria visitante antigo ver o vídeo velho.
**Não edite o site** (HTML, CSS, JS): quem troca os vídeos no site é outra
etapa. Só entregue os arquivos.

**Onde estão as referências:** na pasta do site (o repositório
`joaoggaete.github.io` ou os ZIPs do site extraídos): `video/` (os vídeos
atuais), `img/` (capas atuais, casa/carro/trator em 3D, logo) e `index.html`
(cores do Apollo). Os roteiros e este guia estão em `docs/videos/`.

**A série é uma só.** O vídeo 1 é produzido primeiro e define o Apollo
vetorizado, a paleta, os ícones do glossário, a trilha sonora e a voz. Se a
pasta do projeto da série já existir (ex.: `C:\astro-videos\`, com o Apollo e
os ícones aprovados), **reaproveite tudo**: não redesenhe o personagem, não
troque a voz nem a família de música, e pule a aprovação 1 abaixo.

**Pare e peça aprovação ao João** em quatro pontos (não siga sem o "ok"):
1. folha de personagem do Apollo + paleta (imagens);
2. animatic com voz provisória (vídeo em baixa, sem acabamento);
3. amostra da voz final (15 s) e da música escolhida;
4. render final, antes de gerar as variações.
E em todo ponto marcado **[VALIDAR]** na especificação.

## 1. A Astro, o site e o papel destes vídeos

- **Posicionamento:** "consórcio estratégico". A Astro não vende só uma carta
  de crédito: analisa o histórico dos grupos, monta a estratégia de lance e
  acompanha o cliente a cada assembleia até a contemplação. Transparência
  (custos e riscos por escrito), sem promessa de prazo, atendimento humano.
- **Público:** duas pessoas ao mesmo tempo, em todo vídeo:
  - quem **nunca fez consórcio** (tem medo de "ficar preso pagando", não
    entende sorteio e lance, confunde com financiamento);
  - quem **já conhece** (quer estratégia: grupo, lance, custo de
    oportunidade, uso patrimonial). Inclui público de alta renda.
- **Onde os vídeos aparecem:** página inicial, páginas de solução (imóveis,
  veículos, maquinário), `/videos` (trilha: Entenda → Por que a Astro →
  Formas de usar), `/como-funciona`, `/lances`, `/sobre`, `/contato` e
  anúncios em redes sociais (versão 9:16). Ao lado de cada vídeo o site mostra
  título, resumo e o roteiro por escrito.
- **Ação única do site:** "Simular meu crédito" (simulação gratuita, por
  escrito, feita por uma pessoa). Todo vídeo termina levando a ela — exceto
  onde a especificação disser outra coisa.

## 2. Didática — como ensinar em 40 segundos (baseado em evidência)

Regras derivadas da pesquisa de aprendizagem multimídia (Richard Mayer) e da
teoria da carga cognitiva (John Sweller). Aplique todas:

1. **Um conceito por cena.** Nunca dois termos novos na mesma cena
   (segmentação).
2. **Imagem + narração, pouco texto na tela.** O que a voz explica, o desenho
   mostra; na tela, só a **palavra-chave** (1 a 3 palavras) além da legenda
   (modalidade e redundância).
3. **Palavra e imagem juntas no tempo e no espaço.** O ícone aparece no
   instante em que a palavra é dita, e o rótulo fica colado no ícone
   (contiguidade).
4. **Sinalização.** O elemento que está sendo explicado acende (brilho,
   escala 1,05, cor); o resto recua para 40% de opacidade.
5. **Nada decorativo que concorra** com a explicação (coerência): sem
   partículas, sem textos correndo, sem transições chamativas.
6. **Defina antes de usar (pré-treino).** Todo termo técnico ganha uma
   definição de uma frase na primeira vez: "lance — um valor que você
   adianta pra ser contemplado antes".
7. **Tom de conversa, na 2ª pessoa** ("você", "a gente"), frases curtas,
   verbos concretos (personalização).
8. **Voz humana e natural** — a pesquisa mostra que voz humana ensina melhor
   que voz robótica (princípio da voz). Ver seção 7.
9. **Um guia na tela com gestos** — o Apollo aponta para o que está sendo
   explicado (princípio da corporificação).
10. **Duas camadas em todo vídeo:** a explicação básica (para quem não
    conhece) e **um insight estratégico** marcado na tela com o rótulo
    `PARA QUEM JÁ CONHECE` (para quem conhece). O iniciante não se perde; o
    experiente não se entedia.
11. **Recapitulação em uma frase** com os ícones do vídeo em linha, antes do
    final.
12. **Tem que funcionar sem som.** Boa parte do vídeo em redes sociais é
    visto no mudo (orientação da própria Meta: planejar para "som
    desligado"). Legenda queimada + palavras-chave garantem isso.
13. **Duração:** respeite a faixa da especificação. Vídeos curtos retêm mais;
    o engajamento cai de forma marcada depois de ~2 minutos (dados de
    audiência de plataformas de vídeo como a Wistia). Nenhum vídeo desta
    série passa de 80 s.

### Glossário visual fixo (mesmo ícone para o mesmo conceito em todos os vídeos)

| Conceito | Ícone (linha 2 px, cantos arredondados) | Cor |
|---|---|---|
| Grupo | círculo de 12 pontos | azul `#7FD4FF` |
| Você no grupo | 1 ponto do círculo em ouro | ouro |
| Parcela mensal | moeda com seta circular | azul |
| Fundo comum | pote/cofre ao centro do círculo | azul |
| Assembleia | calendário com o dia marcado | azul |
| Sorteio | um ponto do círculo pisca e se destaca | ouro |
| Lance | seta para cima com "%" | ouro |
| Lance embutido | cartão dourado com uma fatia recortada | ouro |
| Carta de crédito | cartão dourado com brilho | ouro |
| Contemplação | check dentro de círculo + brilho | ouro |
| Taxa de administração | "%" dentro de etiqueta | azul |
| Juros / financiamento | barra que cresce | bronze `#A8763A` |
| Banco Central / lei | escudo com "Lei 11.795" | azul |
| WhatsApp | balão com check | verde `#2EDB70` |
| Imóvel · veículo · máquina · empresa | casa · carro · trator · prédio (mesmo traço) | azul |

## 3. Persuasão ética e comportamento humano

O vídeo vende **clareza**, não pressão. Use a ciência do comportamento para
explicar melhor e para gerar confiança, nunca para enganar.

- **O cliente é o herói; o Apollo é o guia** (estrutura StoryBrand): a
  história é sobre o que o espectador quer conquistar; o Apollo mostra o
  caminho e o plano.
- **Desejo e angústia (leitura psicanalítica, sem jargão no vídeo).** Casa,
  carro e máquina carregam significado de segurança, pertencimento, conquista
  e legado; dívida e juros despertam angústia e sensação de perda de
  controle. O vídeo **acolhe a angústia e dá contorno**: nomeia o medo com
  calma ("você vai ficar preso pagando?") e responde com passos claros.
  Nomear um sentimento reduz sua intensidade (pesquisa de "affect labeling",
  Lieberman et al., 2007) — por isso toda especificação tem "a parte honesta".
- **Aversão à perda** (Kahneman e Tversky): as pessoas sentem mais a perda
  que o ganho equivalente. Mostre os **juros que deixam de ser pagos** e o
  **rendimento que deixa de ser perdido** — com números do simulador do site,
  nunca exagerados.
- **Ancoragem:** mostre primeiro o custo do financiamento (barra bronze) e
  depois o do consórcio (barra azul), lado a lado.
- **Contabilidade mental** (Richard Thaler): as pessoas separam o dinheiro em
  "gavetas" (reserva, parcela, lance). Use isso para explicar lance próprio ×
  lance embutido.
- **Mensagem de dois lados:** apresentar também limites e riscos aumenta a
  credibilidade, sobretudo com público informado e cético (meta-análises de
  comunicação persuasiva, p.ex. Allen, 1991). Por isso a "parte honesta" é
  obrigatória, com o mesmo destaque visual do resto.
- **Princípios de Cialdini, só nas versões legítimas:** autoridade real (Lei
  11.795/2008, Banco Central); reciprocidade (simulação grátis, por escrito);
  compromisso pequeno (o próximo passo é só simular); simpatia (Apollo).
  **Prova social só com dado real:** "quase 13 milhões de participantes
  ativos em consórcio no Brasil (ABAC, abr/2026)". **Urgência só a real:** a
  assembleia é mensal — quem entra antes dela já participa do próximo sorteio.
- **Proibido:** prometer ou sugerir prazo de contemplação; "garantido",
  "sem risco", "o melhor do mercado"; números inventados; depoimentos ou
  clientes fictícios; logotipo de administradora sem autorização; contagem
  regressiva falsa; música ou efeitos de tensão para assustar.

## 4. O personagem Apollo

O Apollo já existe nos vídeos atuais e **precisa ficar idêntico** (o público
reconhece o personagem). Referência:

- Extraia quadros dos vídeos atuais em `video/` do repositório do site, por
  exemplo: `ffmpeg -ss 3 -i video/astro-v1-narrado-v4.mp4 -frames:v 1 ref/apollo-01.png`
  (repita em 5–8 momentos e vídeos diferentes: de frente, apontando,
  acenando, pensando).
- Cores oficiais (as mesmas do ícone do Apollo no site, `index.html`,
  gradientes `apolloOuro`, `apolloTraje`, `apolloVisor`):
  - ouro (anel, detalhes): `#A8712C → #DCAF56 → #F5DC9A → #CE9A4C → #8A5A22`
  - traje: `#FFFFFF → #DCE7F6 → #AFC2DC`
  - viseira: `#16345F → #0A1C38 → #05101F`, reflexo `#BFE4FF` a 55%
- Astronauta pequeno e simpático, traje branco-azulado, viseira escura com
  **dois olhos grandes desenhados na viseira** (não tem boca), anel orbital
  dourado (o mesmo da marca Astro).
- **Reconstrua o Apollo como vetor com partes articuladas** (cabeça,
  viseira/olhos, tronco, braços, mãos), para animar sem perder nitidez.
  Primeiro entregue uma **folha de personagem** (frente, ¾, apontando,
  acenando, polegar para cima, pensando, feliz) e espere aprovação.
- **Como ele "fala" sem boca:** leve balanço da cabeça (±2°) e brilho da
  viseira acompanhando a amplitude da voz; piscar a cada 3–5 s; gestos só
  nos momentos de explicação (apontar para o elemento que acende).
- Ele **narra** (é a voz dele), mas nunca ocupa mais que 25% da tela: o
  conteúdo é o protagonista.

## 5. Direção de arte

- **Fundo:** azul-marinho quase preto `#03060F`, com brilho radial suave
  `#0B1526`/`#14356B` atrás do conteúdo; céu com poucas estrelas estáticas
  (como nos vídeos atuais). Adicione **grão de 2–3%** para evitar faixas
  (banding) nos degradês escuros depois da compressão.
- **Cores:** linhas e ícones `#7FD4FF` e `#3B8FE0`; ouro (destaques, conquista,
  carta, lance) com o degradê do Apollo; bronze `#A8763A` só para
  financiamento/juros; verde `#2EDB70` só para WhatsApp/confirmação; texto
  `#F2F6FC` e secundário `#93A9C9`. Vermelho não existe na marca.
- **Tipografia (as mesmas do site):** Sora 700 (títulos curtos), Manrope
  400/600 (legendas), JetBrains Mono 500 em caixa-alta com espaçamento 0,2 em
  (rótulos pequenos, como `PARA QUEM JÁ CONHECE`, `VALORES ILUSTRATIVOS`).
- **Movimento:** entradas de 300–600 ms com curva suave (equivalente a
  `cubic-bezier(.22,1,.36,1)`); linhas se desenham (traço animado); números
  contam até o valor. Nada pisca mais de 3 vezes por segundo (acessibilidade,
  WCAG 2.3.1). Troca de cena por fusão curta ou movimento de câmera, nunca
  efeitos de transição chamativos.
- **Layout 16:9:** Apollo num terço lateral; diagrama no centro; faixa de
  legenda nos 12% de baixo. **9:16:** Apollo no alto, diagrama no meio,
  legenda entre 62% e 75% da altura (os 20% de baixo e 12% de cima ficam
  livres para a interface das redes).
- **Números na tela:** sempre com o rótulo `VALORES ILUSTRATIVOS · SIMULADOR
  ASTRO` junto. Valores monetários em Manrope 600, com separador brasileiro
  (R$ 300.000).

## 6. Estrutura padrão de cada vídeo

| Tempo | Bloco | O que acontece |
|---|---|---|
| 0–3 s | **Gancho** | Pergunta ou contraste que o espectador sente como dele, em texto grande (Sora) + voz. As redes decidem em ~3 s se a pessoa fica (orientação de criativos da Meta). |
| 3–8 s | **Promessa** | "Em X segundos você entende…" + apresentação curta do Apollo (só nos vídeos 1 e 10 ele diz o nome). |
| corpo | **3 a 4 passos** | Um conceito por passo: ícone aparece → narração → rótulo. |
| — | **A parte honesta** | Limites e riscos, com o mesmo destaque visual. |
| — | **Para quem já conhece** | Um insight estratégico com o rótulo mono. |
| últimos 8–10 s | **Recapitulação + chamada** | Uma frase com os ícones em linha; depois cartão final: botão "Simular meu crédito", endereço do site e, menor, o WhatsApp. 1 s de logo Astro com a assinatura sonora. |

**Os tempos marcados no roteiro são referência de proporção.** O tempo real
de cada cena sai da narração gravada: grave (ou gere) a voz primeiro, marque
onde cada frase começa e ajuste as cenas a ela — nunca acelere a voz para
caber num tempo. A duração-alvo de cada especificação já considera o tamanho
do texto a ~155 palavras por minuto, com as pausas.

**Cartão final:** use o domínio e o WhatsApp **que o João informar**. Se não
informar, escreva só "Simule no site da Astro" e não mostre número de
telefone (o `(45) 99999-9999` que aparece hoje no site é provisório e **não
pode** ir para o vídeo).

## 7. Voz (a voz do Apollo)

- **Perfil:** português do Brasil, adulto (30–45 anos), timbre médio-grave,
  calmo, seguro, "sorriso na voz", sem cara de locutor de varejo nem de
  robô. Mesma voz nos 10 vídeos.
- **Ritmo:** 145–160 palavras por minuto; pausas de 0,3–0,5 s entre os
  blocos; ênfase leve nas palavras-chave. Números por extenso na fala
  ("trezentos mil"); siglas: "INCC" e "IPCA" letra por letra; "Lei onze mil
  setecentos e noventa e cinco".
- **Opções, em ordem de preferência:**
  1. **Locutor humano** com contrato de cessão de voz e imagem para uso
     comercial (melhor para credibilidade).
  2. **Voz sintética comercial com licença de uso comercial** (por exemplo,
     vozes neurais pt-BR de provedores de nuvem ou plataformas de voz), com o
     plano que autoriza uso comercial.
  3. **Voz sintética local.** Confirme a licença do **modelo e da voz** antes
     de usar: há modelos populares com pesos **não comerciais** (por exemplo,
     XTTS-v2 sob a Coqui Public Model License e F5-TTS sob CC-BY-NC), que não
     servem para um site comercial. Uma opção com licença permissiva é o
     Kokoro-82M (Apache-2.0, tem vozes pt-br) — confira a licença da versão
     que baixar. Modelos pequenos rodam bem na CPU; não dependa da GPU para
     voz.
- Registre no relatório: voz usada, licença, link/comprovante.

## 8. Música e som

- **Música de fundo instrumental, sem letra**, 85–100 BPM, "corporativa
  ambiente" / "lo-fi elegante": piano ou pluck suave, pads, pulso leve.
  Arco: curiosidade (gancho) → confiança (corpo) → leve elevação no cartão
  final. Nada de tensão, suspense ou "urgência".
- **Identidade sonora da série:** uma faixa (ou variações da mesma) por trilha
  do site: *Entenda* (v1, v8) · *Por que a Astro* (v9, v10) · *Formas de usar*
  (v2 a v7). Assinatura sonora de 2–3 notas no logo final, igual em todos.
- **Mixagem:** a música fica 20–24 dB abaixo da voz enquanto ele fala
  (ducking automático ou automação de volume) e sobe um pouco nas pausas e no
  final. Efeitos discretos: "tick" suave no check, "whoosh" curto na troca de
  cena, moeda sutil — sempre abaixo da voz.
- **Loudness final:** −16 LUFS integrado, pico real ≤ −1 dBTP (referência usual
  para web e redes; o YouTube normaliza em torno de −14). Áudio AAC 48 kHz,
  estéreo, 160 kbps.
- **Licença:** biblioteca com uso comercial claro (guarde o comprovante) ou
  composição própria. Evite modelos de geração de música com pesos não
  comerciais (p.ex. os pesos públicos do MusicGen são CC-BY-NC).

## 9. Legendas

- **Queimadas no vídeo** e também em arquivo `.vtt` separado (o `.vtt` não tem
  as palavras destacadas, só o texto).
- No máximo **2 linhas**, até **42 caracteres por linha**, velocidade de
  leitura até **~17 caracteres por segundo** (referência de guias
  profissionais de legendagem), cada legenda entre 1 e 6 s, quebra por
  sentido (nunca separar artigo do substantivo).
- Manrope 600, branco `#F2F6FC`, sombra suave para ler sobre qualquer fundo,
  sem caixa sólida. **No máximo uma palavra destacada** por legenda (ouro para
  conquista/lance/carta; azul para conceito; bronze para juros).
- Sincronize por alinhamento forçado da narração (por exemplo, faster-whisper
  ou WhisperX na CPU) e revise à mão. Ortografia e acentuação impecáveis.

## 10. Números e fatos permitidos (fonte única: o simulador do site)

Taxas de referência do site (`taxas.js`), set/2026 — **use só estes**:

| | Imóvel | Veículo | Maquinário |
|---|---|---|---|
| Taxa de administração (total no prazo) | 20% | 16% | 12,5% |
| Fundo de reserva | 2% | 2% | 2% |
| Prazos | 60 a 240 meses | 60 a 140 | 60 a 140 (grupos agro ~110–135) |
| Reajuste do crédito | INCC | IPCA | IPCA |
| Teto usual de lance embutido | 30% | 25% | 25% |
| Juros de referência do financiamento | 0,95% ao mês | 1,75% ao mês (CDC) | não comparar (varia por linha) |

Exemplos já calculados pelo simulador (arredonde na fala, exato na tela):

| Caso | Consórcio | Financiamento |
|---|---|---|
| Imóvel R$ 300.000 · 120 meses | parcela ~R$ 3.126 · total ~R$ 375.075 | parcela ~R$ 4.318 · total ~R$ 518.205 (juros ~R$ 204 mil) |
| Veículo R$ 90.000 · 60 meses | parcela ~R$ 1.788 · total ~R$ 107.298 | parcela ~R$ 2.527 · total ~R$ 151.592 |
| Maquinário R$ 200.000 · 120 meses | parcela ~R$ 1.949 · total ~R$ 233.840 | (não mostrar) |

- Renda fixa de referência: CDI 13,90% ao ano, Selic 14,00% (08/09/2026).
  R$ 300 mil a 100% do CDI rendem ~R$ 3.270/mês bruto, ~R$ 2.780 líquido
  (IR 15%, simplificado).
- Mercado (ABAC): 12,94 milhões de participantes ativos (abr/2026, recorde);
  5,16 milhões de cotas vendidas em 2025.
- Regulação: Lei nº 11.795/2008; administradoras autorizadas e fiscalizadas
  pelo Banco Central; contrato é com a administradora; **nenhum pagamento
  passa pela Astro**.
- Contemplação: por sorteio ou lance, conforme as regras de cada grupo;
  **nenhum prazo é garantido**.

## 11. Pipeline técnico na RX 9070 XT (Windows)

- **Projeto fora da pasta do site** (ex.: `C:\astro-videos\`), para não subir
  `node_modules` e renders para a hospedagem.
- **Animação por código, determinística** (o mesmo resultado a cada render,
  fácil de revisar e ajustar roteiro): recomendado **Remotion** (React/
  TypeScript) — no Windows use `--gl=angle` no render para a GPU desenhar via
  Direct3D; confira a licença (gratuita para pessoa física e empresas
  pequenas). Alternativa: **Motion Canvas** (MIT). Monte as cenas de modo que
  16:9 e 9:16 saiam da mesma composição, só mudando o layout.
- **Codificação (FFmpeg com AMD AMF):** confirme os codificadores com
  `ffmpeg -hide_banner -encoders | findstr amf` (use uma versão "full" do
  FFmpeg para Windows). Prévias rápidas com `h264_amf`. Final do site:
  **H.264**, `yuv420p`, 30 fps, `-movflags +faststart`, alvo 1,5–2,5 Mb/s em
  1080p (os vídeos atuais têm ~1 Mb/s e ~1 MB a cada 8 s). Compare `h264_amf`
  no modo de qualidade com `libx264 -crf 20 -preset slow`: fique com o que
  der **menos faixas nos degradês escuros** no mesmo tamanho. Não use AV1/HEVC
  no arquivo do site (compatibilidade).
- **Áudio:** mixe voz + música + efeitos; normalize com `loudnorm` do FFmpeg em
  duas passadas para −16 LUFS / −1 dBTP.
- **Capa:** quadro-chave do vídeo com o Apollo e o título curto (2–4 palavras,
  Sora 700), legível em 320 px de largura.

## 12. Checklist de qualidade (antes de entregar)

- [ ] Entende-se o vídeo inteiro **sem som** (só legenda e imagem).
- [ ] Um iniciante consegue explicar o conceito depois de assistir; um
      experiente aprende o insight marcado.
- [ ] Todo termo técnico foi definido na primeira vez que apareceu.
- [ ] Nenhuma promessa de prazo, nenhum número fora da seção 10, rótulo
      `VALORES ILUSTRATIVOS` junto de todo valor.
- [ ] "A parte honesta" presente e visível.
- [ ] Apollo idêntico ao dos vídeos atuais; ícones do glossário visual.
- [ ] Legendas: ≤ 2 linhas, ≤ 42 caracteres, sem erro de português, `.vtt` bate
      com o áudio.
- [ ] −16 LUFS ±1, pico ≤ −1 dBTP; música nunca encobre a voz.
- [ ] Nada pisca acima de 3 Hz; texto legível num celular.
- [ ] 16:9 e 9:16 conferidos inteiros; nada importante nas zonas da interface.
- [ ] Cartão final com domínio/WhatsApp confirmados pelo João (ou sem eles).
- [ ] Nomes de arquivo exatamente como no item 0; relatório com licenças.

## Base de pesquisa citada

- Mayer, R. E. *Multimedia Learning* (princípios de aprendizagem multimídia).
- Sweller, J. — teoria da carga cognitiva.
- Kahneman, D.; Tversky, A. (1979) — teoria da perspectiva (aversão à perda).
- Thaler, R. — contabilidade mental.
- Cialdini, R. *Influence* — princípios de persuasão.
- Allen, M. (1991) — meta-análise sobre mensagens de um e de dois lados.
- Lieberman, M. et al. (2007) — "affect labeling": nomear emoções reduz sua intensidade.
- Miller, D. *StoryBrand* — cliente como herói, marca como guia.
- Meta — boas práticas de criativos em vídeo (gancho nos 3 primeiros segundos, pensar para som desligado).
- Wistia — dados de engajamento por duração de vídeo.
- WCAG 2.3.1 (três flashes); guias profissionais de legendagem (velocidade de leitura).
- ABAC — dados do mercado de consórcios (via Estado de Minas, set/2026).
