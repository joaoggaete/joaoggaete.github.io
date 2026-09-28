/* ============================================================================
   BANCO DE CENÁRIOS DO TREINO DE VENDAS
   Tudo pré-escrito, sem IA: cada cenário é uma árvore de decisão curta (3
   momentos, 3 respostas cada). A escolha muda a reação seguinte do cliente
   fictício (clienteSeFracoAntes entra quando a resposta anterior foi fraca)
   e soma pontos que definem o desfecho final. Editar um cenário aqui é só
   editar texto — não tem servidor, não tem chave, não tem custo.
   ========================================================================= */

window.CENARIOS_TREINO = [

  {
    id: 'carro-prospeccao-indicacao', produto: 'carro', etapa: 'prospeccao', dificuldade: 'dificil',
    titulo: 'Contato frio por indicação',
    resumo: 'Um cliente antigo (Sr. Renato) passou o contato da Marina sem ela saber. Ela não pediu, está ocupada e desconfiada.',
    objetivo: 'Quebrar o gelo sem empurrar, despertar curiosidade genuína e conseguir avançar para uma qualificação.',
    turnos: [
      {
        clienteAbertura: 'Marina: "Oi... quem é você? Como conseguiu meu número?"',
        opcoes: [
          { texto: 'Oi, Marina! Sou da Astro Consórcios. O Sr. Renato comentou que você também pensa em trocar de carro e me passou seu contato — se não for um bom momento, me avisa que eu retorno depois.', qualidade: 'ideal', pontos: 3,
            feedback: 'Se identifica, cita a referência certa e dá abertura pra ela recusar sem pressão — quebra o gelo sem empurrar.' },
          { texto: 'Oi Marina, tudo bem? Vim através de uma indicação, queria te apresentar uma oportunidade incrível de consórcio de veículos!', qualidade: 'ok', pontos: 1,
            feedback: 'Não é falso, mas o tom de "oportunidade incrível" liga o sinal de alerta de vendedor chato antes até de ela saber quem é você.' },
          { texto: 'Oi! Vi que você tem interesse em trocar de carro, você tem uns minutos pra eu te explicar como funciona o consórcio?', qualidade: 'fraca', pontos: -1,
            feedback: 'Presume interesse que ela nunca demonstrou e já pede tempo dela sem se identificar — é o gatilho que a deixa mais seca.' }
        ]
      },
      {
        clienteAbertura: 'Marina: "Ah, entendi. E aí, o que exatamente você queria comigo?"',
        clienteSeFracoAntes: 'Marina: "Eu não pedi isso pra ninguém. Quem te disse que eu tenho interesse?"',
        opcoes: [
          { texto: 'Sem compromisso nenhum — só queria saber se hoje faz sentido pra você pensar em trocar de carro, e se sim, te perguntar 2-3 coisas rápidas. Se não for a hora, sem problema.', qualidade: 'ideal', pontos: 3,
            feedback: 'Baixa a guarda dela: sem compromisso, pede permissão, e já avisa que é rápido.' },
          { texto: 'É rapidinho! Só queria entender se você pensa em trocar de carro e te mostrar como funciona o consórcio, pode ser?', qualidade: 'ok', pontos: 1,
            feedback: 'Não é agressivo, mas ainda empurra pra explicação antes de saber se ela topa conversar.' },
          { texto: 'Olha, é uma condição especial que só tá valendo essa semana, por isso quis falar logo com você.', qualidade: 'fraca', pontos: -1,
            feedback: 'Urgência artificial é a receita pra ela ficar ainda mais desconfiada e travar a conversa.' }
        ]
      },
      {
        clienteAbertura: 'Marina: "Ah, tá. Bom, até que um dia eu troco, tá bem velho meu carro..."',
        clienteSeFracoAntes: 'Marina: "Olha, não tô afim de continuar essa conversa não, tá?"',
        opcoes: [
          { texto: 'Perfeito, não precisa decidir nada agora. Posso te ligar outro dia, 10 minutinhos, só pra entender melhor sua situação? Você escolhe o dia.', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha com um próximo passo pequeno e sem pressão, no ritmo dela — exatamente o objetivo desse contato.' },
          { texto: 'Que bom! Deixa eu já te explicar rapidinho como funciona, é bem simples.', qualidade: 'ok', pontos: 1,
            feedback: 'Perde a abertura que ela deu: ela topou seguir conversando, mas ainda não é hora de explicar tudo, é hora de agendar.' },
          { texto: 'Show, então já te mando aqui os valores e condições que tenho disponíveis!', qualidade: 'fraca', pontos: -1,
            feedback: 'Ela mal abriu a porta e já leva número — a essa altura, provavelmente ela nem lê.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Marina: "Tá bom, pode me ligar quinta de tarde. Só isso, não me manda nada por escrito ainda, tá?"',
      ok: 'Marina: "Pode ser, mas não prometo nada, viu."',
      fraco: 'Marina: "Olha, prefiro não continuar. Obrigada." (ela para de responder)'
    }
  },

  {
    id: 'carro-objecao-caro', produto: 'carro', etapa: 'objecoes', dificuldade: 'facil',
    titulo: '"Achei mais caro que financiamento"',
    resumo: 'Diego viu a simulação de um carro de R$ 90 mil no consórcio e comparou por cima com um financiamento do banco.',
    objetivo: 'Explicar com clareza a diferença entre juros e taxa de administração, sem inventar número que não esteja no material aprovado.',
    turnos: [
      {
        clienteAbertura: 'Diego: "Vi a simulação do consórcio pra um carro de 90 mil. Comparei com um financiamento que fiz no banco e o consórcio parece mais caro."',
        opcoes: [
          { texto: 'Entendo a comparação — só uma pergunta antes: no financiamento que você viu, qual foi a taxa de juros ao ano que te passaram?', qualidade: 'ideal', pontos: 3,
            feedback: 'Investiga o número real dele antes de argumentar no vácuo — sem isso, qualquer resposta é chute.' },
          { texto: 'É diferente sim, mas no fim das contas o consórcio costuma sair mais barato.', qualidade: 'ok', pontos: 1,
            feedback: 'Afirma sem embasar e sem saber os números que ele está comparando — arriscado dizer "costuma" sem contexto.' },
          { texto: 'Isso é porque no banco você não vê a taxa escondida, aqui é tudo mais transparente.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desqualifica o financiamento sem prova e soa como discurso de vendas, não resposta técnica.' }
        ]
      },
      {
        clienteAbertura: 'Diego: "Ah, é. Acho que era uns 11% ao ano, não lembro certo."',
        clienteSeFracoAntes: 'Diego: "Não sei os números de cabeça, só sei que a parcela lá parecia menor."',
        opcoes: [
          { texto: 'Faz sentido a parcela parecer menor: no financiamento você paga juros compostos todo mês, geralmente entre 9,5% e 12% ao ano. No consórcio não tem juros, só uma taxa de administração diluída — no exemplo do nosso simulador, pra um bem de 300 mil em 120 meses, o custo total ficou perto de 354 mil no consórcio contra 516 mil no financiamento, mas isso são estimativas, o valor real depende da administradora e do seu perfil.', qualidade: 'ideal', pontos: 3,
            feedback: 'Explica a diferença real (juros compostos x taxa diluída), usa só números do material aprovado e deixa claro que são estimativas.' },
          { texto: 'É, juros de financiamento são bem mais caros no final das contas, o consórcio compensa mais.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa, mas sem números nem explicação técnica ele fica sem entender o porquê, só a sua palavra.' },
          { texto: 'No seu caso acredito que vai economizar uns 40%, tranquilamente.', qualidade: 'fraca', pontos: -1,
            feedback: 'Inventou um percentual que não existe em nenhum material — é o tipo de número que pode virar problema depois.' }
        ]
      },
      {
        clienteAbertura: 'Diego: "Entendi, faz sentido. E isso vale garantido ou pode variar?"',
        clienteSeFracoAntes: 'Diego: "Ok, mas isso é garantido esse valor que você falou?"',
        opcoes: [
          { texto: 'Não é garantido, são estimativas do simulador — o valor real depende da administradora, do grupo e do seu perfil. Quer que eu monte uma simulação específica pro seu caso pra ver os números certos?', qualidade: 'ideal', pontos: 3,
            feedback: 'Reforça que não é garantia (evita promessa proibida) e propõe o próximo passo certo: simulação real.' },
          { texto: 'Isso, é bem parecido com isso na prática.', qualidade: 'ok', pontos: 1,
            feedback: 'Deixa a entender que é garantido, o que pode gerar expectativa que a Astro não pode cumprir.' },
          { texto: 'Sim, pode confiar, vai ser exatamente assim ou até melhor.', qualidade: 'fraca', pontos: -1,
            feedback: 'Isso é uma promessa que a Astro nunca deveria fazer — números variam por administradora e perfil.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Diego: "Ah entendi, faz sentido agora. Bora simular pra ver certinho."',
      ok: 'Diego: "Tá, mas ainda tô meio no ar, vou pensar."',
      fraco: 'Diego: "Hmm, prometido é meio estranho isso. Vou comparar melhor antes."'
    }
  },

  {
    id: 'carro-posvenda-atraso', produto: 'carro', etapa: 'posvenda', dificuldade: 'dificil',
    titulo: 'Atrasou a parcela e quer desistir',
    resumo: 'Cláudia já é consorciada há 8 meses, atrasou a parcela do mês passado e está pensando em desistir do grupo.',
    objetivo: 'Acolher sem julgar, esclarecer que o contrato é com a administradora, e manter o cliente no grupo.',
    turnos: [
      {
        clienteAbertura: 'Cláudia: "Oi... eu atrasei a parcela do mês passado e tô pensando em desistir do consórcio. Não sei se vou dar conta."',
        opcoes: [
          { texto: 'Ei, que bom que você me contou. Antes de pensar em desistir, me conta o que aconteceu? Vamos ver juntos as opções.', qualidade: 'ideal', pontos: 3,
            feedback: 'Acolhe sem julgar e abre espaço pra ela desabafar antes de qualquer solução — o primeiro passo certo.' },
          { texto: 'Calma, atraso acontece, não precisa desistir por isso.', qualidade: 'ok', pontos: 1,
            feedback: 'Tenta tranquilizar mas não escuta o motivo nem convida ela a explicar — parece querer encerrar o assunto rápido.' },
          { texto: 'Poxa, mas já pensou que se desistir agora você perde tudo que pagou?', qualidade: 'fraca', pontos: -1,
            feedback: 'Usa medo/pressão logo de cara, sem acolher — pode fazer ela se sentir pior e mais na defensiva.' }
        ]
      },
      {
        clienteAbertura: 'Cláudia: "Fiquei sem caixa esse mês, imprevisto. Só não sei o que fazer com o boleto atrasado agora."',
        clienteSeFracoAntes: 'Cláudia: "Olha, eu só quero saber se dá pra sair sem perder tudo, mais nada."',
        opcoes: [
          { texto: 'Entendo. Esse boleto é emitido pela administradora, não pela Astro — a gente não recebe esse pagamento. Vale a pena ligar direto pra administradora pra negociar esse atraso antes de qualquer decisão, eles costumam ter opções pra isso.', qualidade: 'ideal', pontos: 3,
            feedback: 'Esclarece de quem é o contrato/boleto (fato correto) e dá um caminho prático antes de desistir.' },
          { texto: 'Você pode tentar negociar isso, mas confesso que não sei todos os detalhes de como funciona.', qualidade: 'ok', pontos: 1,
            feedback: 'Não erra, mas também não ajuda muito — fica vago justo no momento que ela mais precisa de direção.' },
          { texto: 'Deixa comigo, eu resolvo esse boleto pra você, só me passa os dados que eu cuido.', qualidade: 'fraca', pontos: -1,
            feedback: 'Isso é falso e arriscado: o boleto é da administradora, a Astro nunca deveria dizer que resolve isso, e não deve pedir dado sensível sem necessidade.' }
        ]
      },
      {
        clienteAbertura: 'Cláudia: "Ah, bom saber. Vou ligar pra eles então. Obrigada por não me tratar mal por isso."',
        clienteSeFracoAntes: 'Cláudia: "Tá, mas e agora, o que eu faço?"',
        opcoes: [
          { texto: 'Que bom! Fico à disposição se precisar de qualquer coisa depois dessa conversa com eles — sem pressa nenhuma, o importante é você resolver com calma.', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha com acolhimento genuíno, sem tentar vender nada nesse momento — reforça a relação de confiança.' },
          { texto: 'Isso, e aproveitando, já vi aqui que talvez valha a pena você considerar outro grupo com parcela menor no futuro.', qualidade: 'ok', pontos: 1,
            feedback: 'Momento errado pra oferta: ela está em crise financeira, oferecer outro produto agora soa deslocado.' },
          { texto: 'Tranquilo, mas já que você tá aqui, deixa eu te mostrar uma outra oportunidade que pode te interessar.', qualidade: 'fraca', pontos: -1,
            feedback: 'Tentar vender justamente quando ela está fragilizada quebra a confiança que você acabou de construir.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Cláudia: "Muito obrigada mesmo, você me tranquilizou."',
      ok: 'Cláudia: "Tá, vou ver isso, obrigada."',
      fraco: 'Cláudia: "Ok... vou pensar no que fazer." (ainda em dúvida se pode confiar)'
    }
  },

  {
    id: 'moto-qualificacao-sem-orcamento', produto: 'moto', etapa: 'qualificacao', dificuldade: 'medio',
    titulo: 'Quer trocar de moto mas não sabe o orçamento',
    resumo: 'Kaique, 24 anos, quer subir de categoria de moto, mas fica vago quando perguntam quanto pode pagar por mês.',
    objetivo: 'Fazer as perguntas certas de qualificação sem parecer interrogatório nem pular direto para o valor do crédito.',
    turnos: [
      {
        clienteAbertura: 'Kaique: "Cara, quero muito subir pra uma moto acima de 500cc, tô cansado da minha 160."',
        opcoes: [
          { texto: 'Que legal! Antes de tudo, me conta: hoje, depois das contas fixas do mês, quanto costuma sobrar livre pra você?', qualidade: 'ideal', pontos: 3,
            feedback: 'Pergunta objetiva e no momento certo pra entender orçamento real, sem parecer interrogatório.' },
          { texto: 'Boa escolha! Quanto você pode pagar de parcela por mês?', qualidade: 'ok', pontos: 1,
            feedback: 'Pergunta direta, mas pular pra "parcela" antes de entender o orçamento geral pode travar quem não parou pra pensar nisso.' },
          { texto: 'Show! Vou já te passar um crédito de 40 mil pra você ver as opções de moto.', qualidade: 'fraca', pontos: -1,
            feedback: 'Pula a qualificação inteira e chuta um valor de crédito sem saber se cabe no bolso dele.' }
        ]
      },
      {
        clienteAbertura: 'Kaique: "Ah, sei não... o que sobrar, sabe? Não parei pra calcular isso."',
        clienteSeFracoAntes: 'Kaique: "Não sei, cara, depende do mês."',
        opcoes: [
          { texto: 'Sem problema, dá pra pensar junto: você pretende dar sua moto atual como parte do lance, ou seria só financiando pelas parcelas?', qualidade: 'ideal', pontos: 3,
            feedback: 'Muda o ângulo da pergunta pra algo mais concreto (a moto como lance), ajudando ele a pensar sem parecer interrogatório.' },
          { texto: 'Tenta ver aí no extrato do banco quanto te sobrou no mês passado, me fala depois?', qualidade: 'ok', pontos: 1,
            feedback: 'Direção ok, mas empurra a tarefa pra depois em vez de aproveitar a conversa de agora.' },
          { texto: 'Tudo bem, então vamos considerar uma parcela de 800 reais como referência.', qualidade: 'fraca', pontos: -1,
            feedback: 'Decide um valor arbitrário no lugar dele em vez de ajudar ele a descobrir o próprio limite.' }
        ]
      },
      {
        clienteAbertura: 'Kaique: "Ah, pode ser sim, eu daria minha 160 como parte do lance, acho."',
        clienteSeFracoAntes: 'Kaique: "Mas eu não sei se dá pra pagar isso ainda, a gente nem conversou sobre valor."',
        opcoes: [
          { texto: 'Perfeito, isso já ajuda muito. Com isso e o que você me disser de orçamento, consigo te mostrar opções de prazo que realmente cabem no seu mês, sem chute.', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha reforçando que a proposta vai ser baseada no que ele realmente pode pagar — constrói confiança.' },
          { texto: 'Legal, com isso já consigo te passar umas opções de moto interessantes.', qualidade: 'ok', pontos: 1,
            feedback: 'Volta o foco pra "moto" antes de fechar o orçamento — o objetivo dessa etapa era entender o orçamento, não vender a moto ainda.' },
          { texto: 'Perfeito, vou te mandar aqui os planos com a parcela que citei antes.', qualidade: 'fraca', pontos: -1,
            feedback: 'Segue com o valor chutado anteriormente sem nunca ter confirmado se cabe no orçamento dele.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Kaique: "Isso, mano, agora faz sentido, bora ver certinho então."',
      ok: 'Kaique: "Ah, tá, pode mandar aí."',
      fraco: 'Kaique: "Mas eu já disse que não sei se dá pra pagar isso, tá me ignorando?"'
    }
  },

  {
    id: 'moto-objecao-golpe', produto: 'moto', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"Isso não é golpe?"',
    resumo: 'Bruna, 27 anos, ouviu que o tio "perdeu dinheiro" num consórcio e desconfia que seja uma armadilha.',
    objetivo: 'Responder a desconfiança com fatos verificáveis, sem ser condescendente nem prometer nada.',
    turnos: [
      {
        clienteAbertura: 'Bruna: "Meu tio entrou num consórcio, desistiu e disse que perdeu dinheiro. Isso não é meio golpe?"',
        opcoes: [
          { texto: 'Entendo a preocupação, é super válida. Posso te explicar rapidinho como funciona a parte de segurança disso, pra você decidir com mais informação?', qualidade: 'ideal', pontos: 3,
            feedback: 'Valida o medo dela sem debochar e pede permissão antes de explicar — cria espaço pra ela ouvir.' },
          { texto: 'Não, isso não é golpe, é super regulamentado, pode confiar.', qualidade: 'ok', pontos: 1,
            feedback: 'Tenta tranquilizar rápido demais, sem embasar — "pode confiar" sozinho não convence quem já ouviu história ruim.' },
          { texto: 'Seu tio provavelmente não entendeu como funciona, isso é comum quando as pessoas desistem sem saber as regras.', qualidade: 'fraca', pontos: -1,
            feedback: 'Coloca a culpa no tio dela de cara — passa a impressão de desqualificar a pessoa em vez de explicar o sistema.' }
        ]
      },
      {
        clienteAbertura: 'Bruna: "Pode, sim, me explica."',
        clienteSeFracoAntes: 'Bruna: "Tá, mas me convence então, por que eu ia confiar nisso?"',
        opcoes: [
          { texto: 'O consórcio é regido pela Lei Federal 11.795 e fiscalizado pelo Banco Central. O contrato é entre você e a administradora, nunca com a Astro — e você pode consultar essa administradora direto no site do Banco Central antes de assinar qualquer coisa.', qualidade: 'ideal', pontos: 3,
            feedback: 'Usa exatamente os fatos regulatórios corretos e dá um caminho de verificação independente (Banco Central) — constrói confiança com informação real.' },
          { texto: 'É tudo registrado, tem lei que garante, é bem seguro.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa mas vago, sem citar nem a lei nem o Banco Central — fica na promessa genérica.' },
          { texto: 'Pode confiar, a Astro trabalha há anos no mercado e nunca teve problema.', qualidade: 'fraca', pontos: -1,
            feedback: 'Usa a reputação da empresa como garantia, mas ignora o ponto real: o contrato nem é com a Astro, é com a administradora.' }
        ]
      },
      {
        clienteAbertura: 'Bruna: "Ah, isso ajuda. Legal que dá pra confirmar antes de assinar."',
        clienteSeFracoAntes: 'Bruna: "Tá, mas mesmo assim ainda tô meio insegura."',
        opcoes: [
          { texto: 'Faz todo sentido continuar insegura até ver os detalhes por escrito — se quiser, te mando a simulação completa por e-mail, sem compromisso, com contrato e tudo, aí você vê com calma.', qualidade: 'ideal', pontos: 3,
            feedback: 'Não força a segurança dela, oferece transparência concreta (contrato por escrito) como próximo passo.' },
          { texto: 'Vai ver que depois que você entender melhor vai ficar tranquila, é assim com todo mundo.', qualidade: 'ok', pontos: 1,
            feedback: 'Minimiza a insegurança dela em vez de oferecer algo concreto pra resolver.' },
          { texto: 'Relaxa, quase ninguém tem problema com isso, é raríssimo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Usa uma estatística que não existe em nenhum material pra tranquilizar — arriscado inventar isso.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Bruna: "Manda sim, quero ver com calma antes de decidir."',
      ok: 'Bruna: "Tá, deixa eu pensar mais um pouco."',
      fraco: 'Bruna: "Ainda não tô confortável, acho que vou pesquisar mais antes."'
    }
  },

  {
    id: 'moto-fechamento-dois-prazos', produto: 'moto', etapa: 'fechamento', dificuldade: 'medio',
    titulo: 'Indeciso entre dois prazos de grupo',
    resumo: 'Felipe já decidiu entrar no consórcio de moto, só está em dúvida entre parcela menor/prazo longo ou o contrário.',
    objetivo: 'Ajudar a decidir com base no orçamento e no objetivo dele, sem empurrar a opção que fecha mais rápido.',
    turnos: [
      {
        clienteAbertura: 'Felipe: "Decidi entrar no consórcio, só tô em dúvida entre parcela menor com prazo mais longo ou parcela maior com prazo mais curto."',
        opcoes: [
          { texto: 'Antes de indicar, me conta: pra que você quer essa moto, uso do dia a dia ou mais lazer? E sem apertar o orçamento, quanto sobra tranquilo no seu mês?', qualidade: 'ideal', pontos: 3,
            feedback: 'Pergunta o objetivo e o orçamento real antes de recomendar — a decisão certa depende disso, não de qual opção "fecha mais rápido".' },
          { texto: 'As duas são boas, depende do que você prefere: pagar menos por mês ou terminar mais rápido.', qualidade: 'ok', pontos: 1,
            feedback: 'Descreve a diferença óbvia mas não ajuda ele a decidir com base no caso dele.' },
          { texto: 'Eu recomendo a de prazo mais curto, fecha mais rápido e é melhor pra todo mundo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Empurra a opção que fecha mais rápido pro vendedor, sem perguntar nada sobre o caso dele.' }
        ]
      },
      {
        clienteAbertura: 'Felipe: "É mais pro dia a dia, ir trabalhar. Sobra uns 400 por mês sem apertar."',
        clienteSeFracoAntes: 'Felipe: "Ah, sei não, as duas parecem boas mesmo, você que entende disso."',
        opcoes: [
          { texto: 'Então, com 400 de sobra tranquilo, a opção de prazo mais longo te dá uma folga maior se algum mês aparecer imprevisto — e como é uso do dia a dia, não tem pressa em terminar rápido. Eu iria por essa, mas a decisão final é sua.', qualidade: 'ideal', pontos: 3,
            feedback: 'Usa o orçamento e o objetivo dele pra recomendar com justificativa clara, e ainda devolve a decisão pra ele.' },
          { texto: 'Então acho que a de prazo mais longo é melhor pra você.', qualidade: 'ok', pontos: 1,
            feedback: 'Chega na resposta certa mas sem explicar o porquê — ele fica sem entender a lógica.' },
          { texto: 'Tá, então vamos na de prazo mais curto, você paga mais rápido e já aproveita a moto tranquilo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Ignora que ele mesmo disse que a moto é pro dia a dia sem pressa e ainda empurra a opção que ele não pediu.' }
        ]
      },
      {
        clienteAbertura: 'Felipe: "Faz sentido, vamos nessa então, a de prazo mais longo."',
        clienteSeFracoAntes: 'Felipe: "Tá, então vamos na que você acha melhor mesmo."',
        opcoes: [
          { texto: 'Fechado! Vou preparar a documentação dessa opção — qualquer dúvida no meio do caminho, me chama, tá?', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha com clareza no próximo passo e deixa a porta aberta pra dúvidas.' },
          { texto: 'Boa, vou providenciar tudo então.', qualidade: 'ok', pontos: 1,
            feedback: 'Fecha certo, mas sem deixar claro o próximo passo nem abrir espaço pra dúvida.' },
          { texto: 'Perfeito, e já que você confia em mim, aproveita e entra também nesse outro produto que separei pra você.', qualidade: 'fraca', pontos: -1,
            feedback: 'Aproveitar a confiança pra empurrar upsell não pedido no meio do fechamento pode soar oportunista.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Felipe: "Show, obrigado por me ajudar a decidir com calma."',
      ok: 'Felipe: "Ok, confio em você, vamos nessa."',
      fraco: 'Felipe: "Hmm, tá, mas fica só isso mesmo por agora, tá?"'
    }
  },

  {
    id: 'agro-apresentacao-trator', produto: 'agro', etapa: 'apresentacao', dificuldade: 'medio',
    titulo: 'Trator novo: financiamento x consórcio',
    resumo: 'Sr. Osvaldo, produtor rural, já usou financiamento agrícola subsidiado antes e questiona por que pagaria taxa de administração.',
    objetivo: 'Apresentar o consórcio como opção sem desqualificar o financiamento agrícola subsidiado.',
    turnos: [
      {
        clienteAbertura: 'Sr. Osvaldo: "Por que eu ia pagar taxa de administração se existe linha de crédito agrícola com juro camarada?"',
        opcoes: [
          { texto: 'Boa pergunta. Quando tem cota de crédito rural subsidiado disponível, ela pode ser mais barata mesmo — o consórcio entra como alternativa quando essa cota não está disponível, ou quando o senhor não quer usar esse limite pra isso. Faz sentido pro seu caso hoje?', qualidade: 'ideal', pontos: 3,
            feedback: 'Reconhece com honestidade quando o financiamento subsidiado pode ser melhor, e explica em que situação o consórcio faz sentido.' },
          { texto: 'O consórcio tem outras vantagens também, vale a pena considerar.', qualidade: 'ok', pontos: 1,
            feedback: 'Não rebate o ponto dele nem reconhece a validade da linha subsidiada — fica vago.' },
          { texto: 'Essas linhas subsidiadas geralmente têm letras miúdas e burocracia, o consórcio é bem melhor.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desqualifica a linha de crédito rural sem embasamento — ele já usou uma antes e vai notar a informação errada.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Osvaldo: "Hoje eu já usei boa parte do limite do Pronaf nesse ano."',
        clienteSeFracoAntes: 'Sr. Osvaldo: "Isso eu já sei que não é bem assim."',
        opcoes: [
          { texto: 'Então faz sentido olhar o consórcio justamente pra não comprometer mais o limite que o senhor já usou — assim guarda esse crédito subsidiado pra outra necessidade da propriedade.', qualidade: 'ideal', pontos: 3,
            feedback: 'Conecta a situação real dele (limite já usado) com o motivo concreto de considerar o consórcio.' },
          { texto: 'Então o consórcio pode ser uma boa opção complementar nesse momento.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa, mas superficial — não explica a lógica de por que faz sentido complementar.' },
          { texto: 'Sem problema, o consórcio serve pra qualquer situação, sempre vale a pena.', qualidade: 'fraca', pontos: -1,
            feedback: 'Generaliza demais — ele é direto e técnico, esse tipo de resposta genérica perde credibilidade.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Osvaldo: "Certo, faz sentido. E qual a faixa de crédito que vocês atendem pra maquinário?"',
        clienteSeFracoAntes: 'Sr. Osvaldo: "Tá, e teria algum número pra eu ver se vale a pena?"',
        opcoes: [
          { texto: 'A faixa atendida vai de 150 mil a mais de 4 milhões, então dá pra encaixar o valor do maquinário que o senhor precisa. Quer que eu já monte uma simulação pra ver os números certos do seu caso?', qualidade: 'ideal', pontos: 3,
            feedback: 'Responde com o dado real do material aprovado e propõe o próximo passo concreto, sem inventar número.' },
          { texto: 'Atendemos praticamente qualquer faixa de valor, sem problema.', qualidade: 'ok', pontos: 1,
            feedback: 'Vago demais pra alguém direto e técnico como ele — não cita a faixa real que existe no material.' },
          { texto: 'Pra maquinário grande costuma sair uma taxa de administração de uns 12%, bem competitiva.', qualidade: 'fraca', pontos: -1,
            feedback: 'Inventa um percentual de taxa que não está em nenhum material aprovado — arriscado com um cliente técnico que pode cobrar isso depois.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Sr. Osvaldo: "Certo, pode montar essa simulação, quero ver os números."',
      ok: 'Sr. Osvaldo: "Tá bom, me manda uma proposta pra eu analisar."',
      fraco: 'Sr. Osvaldo: "Vou conversar com meu contador antes de continuar essa conversa."'
    }
  },

  {
    id: 'agro-objecao-contador', produto: 'agro', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"Meu contador disse para financiar"',
    resumo: 'Sra. Patrícia repete o argumento do contador: os juros do financiamento são dedutíveis no IR, então compensam mais.',
    objetivo: 'Reconhecer o ponto sem entrar em disputa contábil, trazendo a conversa de volta ao que é seguro comparar.',
    turnos: [
      {
        clienteAbertura: 'Sra. Patrícia: "Meu contador disse que os juros do financiamento são dedutíveis no IR, então compensa mais que o consórcio."',
        opcoes: [
          { texto: 'Isso é uma conta tributária que seu contador é quem deve avaliar com precisão — essa parte eu não posso opinar. Posso te mostrar o que dá pra comparar com segurança, que é o custo sem os juros compostos do financiamento?', qualidade: 'ideal', pontos: 3,
            feedback: 'Reconhece o limite do que pode opinar (tributário não é papel do vendedor) e redireciona pro que é seguro comparar.' },
          { texto: 'Entendo, mas acho que no fim das contas ainda compensa mais o consórcio.', qualidade: 'ok', pontos: 1,
            feedback: 'Discorda sem argumento e sem reconhecer que é uma área que não é sua — pode parecer que está competindo com o contador dela.' },
          { texto: 'Na verdade a dedutibilidade normalmente não compensa tanto quanto parece, isso é conversa de contador querendo vender financiamento.', qualidade: 'fraca', pontos: -1,
            feedback: 'Entra numa discussão tributária que não é papel do vendedor e ainda desqualifica o contador dela.' }
        ]
      },
      {
        clienteAbertura: 'Sra. Patrícia: "Ah, entendi, faz sentido você não entrar nisso. Pode mostrar então."',
        clienteSeFracoAntes: 'Sra. Patrícia: "Você é contador também, por acaso?"',
        opcoes: [
          { texto: 'Não, não sou — por isso mesmo prefiro não opinar sobre a parte fiscal, isso é papel do contador de vocês. O que dá pra te mostrar com segurança é a diferença entre juros compostos do financiamento e a taxa de administração diluída do consórcio, sem entrar no lado tributário.', qualidade: 'ideal', pontos: 3,
            feedback: 'Admite com transparência que não é a pessoa certa pra opinar sobre fiscal, e ainda assim oferece uma comparação útil dentro do que pode falar.' },
          { texto: 'Não sou contador, mas tenho uma noção boa de como funciona essa parte.', qualidade: 'ok', pontos: 1,
            feedback: 'Mesmo negando ser contador, sugere que entende do assunto tributário — mistura os papéis de novo.' },
          { texto: 'Não sou, mas fiz uns cálculos aqui que mostram que compensa mais o consórcio mesmo com a dedução.', qualidade: 'fraca', pontos: -1,
            feedback: 'Faz exatamente a consultoria fiscal que não deveria fazer, com números que não vêm de nenhum material aprovado.' }
        ]
      },
      {
        clienteAbertura: 'Sra. Patrícia: "Tá, faz sentido, vou levar essa comparação pra discutir com ele."',
        clienteSeFracoAntes: 'Sra. Patrícia: "Tá, mas então o que eu faço com o que meu contador falou?"',
        opcoes: [
          { texto: 'Leve essa comparação de custo pra conversa com ele — a decisão final vai ser a soma dos dois pontos de vista, o dele no fiscal e esse do consórcio sem juros. Fico à disposição se surgir mais dúvida depois dessa conversa.', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha devolvendo a decisão pra combinação dos dois pontos de vista, sem tentar vencer o argumento do contador.' },
          { texto: 'Você decide com ele, mas acho que vai fazer sentido pro consórcio no final.', qualidade: 'ok', pontos: 1,
            feedback: 'Ainda tenta empurrar a conclusão a favor do consórcio em vez de deixar realmente aberto.' },
          { texto: 'Leva isso pra ele, mas não deixa ele te convencer só com números de imposto, isso é secundário.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desvaloriza a opinião do contador dela de novo — quebra a confiança bem no fechamento.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Sra. Patrícia: "Combinado, vou levar isso pra conversa com ele, obrigada pela honestidade."',
      ok: 'Sra. Patrícia: "Tá, vou ver o que ele fala ainda."',
      fraco: 'Sra. Patrícia: "Vou confiar mais no que meu contador falar, com toda sinceridade."'
    }
  },

  {
    id: 'agro-posvenda-lance-embutido', produto: 'agro', etapa: 'posvenda', dificuldade: 'medio',
    titulo: 'Contemplado, dúvida sobre lance embutido',
    resumo: 'Sr. Jair foi contemplado por sorteio, mas o crédito não fecha o valor da colheitadeira e está em dúvida sobre lance embutido.',
    objetivo: 'Explicar o que é lance embutido de forma que ele entenda o trade-off, sem decidir por ele nem inventar número.',
    turnos: [
      {
        clienteAbertura: 'Sr. Jair: "Fui contemplado por sorteio, mas o crédito ficou abaixo do valor da colheitadeira. Falaram de lance embutido, isso não é eu pagando duas vezes?"',
        opcoes: [
          { texto: 'Não é isso, não — deixa eu explicar rapidinho como funciona antes do senhor decidir qualquer coisa, pode ser?', qualidade: 'ideal', pontos: 3,
            feedback: 'Corrige a dúvida sem soar corretivo e pede espaço pra explicar com calma.' },
          { texto: 'Não, não é bem assim, mas é meio confuso mesmo de entender.', qualidade: 'ok', pontos: 1,
            feedback: 'Tranquiliza mas não avança pra explicação nem confirma se pode continuar.' },
          { texto: 'Não, imagina, lance embutido é ótimo, todo mundo usa.', qualidade: 'fraca', pontos: -1,
            feedback: 'Minimiza a preocupação real dele sem explicar nada — ele continua sem entender o mecanismo.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Jair: "Pode, explica."',
        clienteSeFracoAntes: 'Sr. Jair: "Então explica de um jeito que eu entenda, porque do jeito que me falaram parecia estranho."',
        opcoes: [
          { texto: 'O lance embutido usa uma parte do próprio crédito que o senhor já tem contemplado como lance — ou seja, reduz o crédito líquido que sobra pra usar, não é dinheiro extra saindo do seu bolso. A vantagem é complementar o valor da colheitadeira sem esperar mais uma contemplação.', qualidade: 'ideal', pontos: 3,
            feedback: 'Explica o mecanismo real com clareza (usa o próprio crédito, não é dinheiro extra) — exatamente o que ele precisava entender.' },
          { texto: 'É tipo usar uma parte do crédito pra ajudar a fechar o valor, mas não sei explicar todos os detalhes certinho.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa mas incompleta — ele pode continuar com dúvida sobre o mecanismo exato.' },
          { texto: 'É tipo um desconto que a administradora dá pra quem quer o bem mais rápido.', qualidade: 'fraca', pontos: -1,
            feedback: 'Explica errado — não é um desconto, é usar parte do próprio crédito. Pode gerar uma expectativa equivocada.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Jair: "Ah, entendi agora. E quanto eu ofereceria de lance, nesse caso?"',
        clienteSeFracoAntes: 'Sr. Jair: "Tá, mas quanto ficaria isso no final, você sabe me dizer?"',
        opcoes: [
          { texto: 'Esse valor específico e a modalidade certa fazem parte da estratégia que é montada caso a caso — vou levar sua situação pra quem faz esse cálculo com precisão e te retorno com os números certos, tudo por escrito.', qualidade: 'ideal', pontos: 3,
            feedback: 'Não inventa número na hora (evita erro grave) e encaminha pro cálculo correto — segue o processo real da Astro.' },
          { texto: 'Deve ficar em torno de 15% do crédito, mas confirma isso depois com a equipe.', qualidade: 'ok', pontos: 1,
            feedback: 'Chuta um percentual sem confirmação — mesmo pedindo pra confirmar depois, já plantou um número que pode não ser real.' },
          { texto: 'Dá pra fechar oferecendo 20% do crédito como lance, pode confiar nesse número.', qualidade: 'fraca', pontos: -1,
            feedback: 'Inventa um número exato e garante confiança nele — o tipo de promessa que pode gerar problema real depois.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Sr. Jair: "Entendi bem agora, fico esperando os números certos então."',
      ok: 'Sr. Jair: "Tá, mas quero ver isso por escrito antes de decidir."',
      fraco: 'Sr. Jair: "Isso não me deixou muito seguro não, vou perguntar pra outra pessoa também."'
    }
  },

  {
    id: 'imovel-qualificacao-primeiro-ape', produto: 'imovel', etapa: 'qualificacao', dificuldade: 'facil',
    titulo: 'Casal comprando o primeiro apartamento',
    resumo: 'Ana e Pedro, primeira compra de imóvel, animados mas com muitas perguntas básicas misturadas de uma vez.',
    objetivo: 'Organizar as perguntas de qualificação sem sufocar o entusiasmo do casal.',
    turnos: [
      {
        clienteAbertura: 'Ana: "Ai, tô tão animada! Quero saber sobre contemplação, sobre reforma, se dá pra usar FGTS... tanta coisa!"',
        opcoes: [
          { texto: 'Que demais esse momento! Vamos por partes: me conta primeiro, vocês procuram apartamento pra morar já ou tem alguma coisa específica em mente, tipo região?', qualidade: 'ideal', pontos: 3,
            feedback: 'Acolhe a animação, mas organiza a conversa com uma pergunta de cada vez — evita a confusão que ela mesma trouxe.' },
          { texto: 'Calma, vou te explicar tudo isso, uma coisa de cada vez, começando pela contemplação.', qualidade: 'ok', pontos: 1,
            feedback: 'Boa intenção de organizar, mas começa pela parte mais complexa (contemplação) em vez da qualificação básica primeiro.' },
          { texto: 'Deixa eu te explicar rapidinho sobre FGTS, contemplação e reforma, tudo de uma vez, pra você já entender tudo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Tenta responder tudo simultaneamente, exatamente o que gera a confusão que ela já estava sentindo.' }
        ]
      },
      {
        clienteAbertura: 'Ana: "Ah, queremos numa região mais tranquila, perto de onde trabalhamos. Deixa eu ver com o Pedro o valor certo."',
        clienteSeFracoAntes: 'Ana: "Ai, mas eu já ia perguntar outra coisa, tá confuso isso."',
        opcoes: [
          { texto: 'Sem pressa, combinado com o Pedro. Enquanto isso, me diz: pensando no que cabe tranquilo no orçamento de vocês por mês, vocês já têm uma ideia de parcela confortável?', qualidade: 'ideal', pontos: 3,
            feedback: 'Segue qualificando com calma, dando espaço pra ela conferir com o Pedro sem travar a conversa.' },
          { texto: 'Tranquilo, e quanto vocês pensam em pagar por mês, mais ou menos?', qualidade: 'ok', pontos: 1,
            feedback: 'Pergunta certa, mas ignora que ela pediu um instante pra falar com o Pedro — pode parecer que não ouviu.' },
          { texto: 'Tudo bem, enquanto isso deixa eu já te explicar sobre o FGTS que você perguntou antes.', qualidade: 'fraca', pontos: -1,
            feedback: 'Volta pra outro assunto sem terminar a qualificação — mantém a sensação de bagunça na conversa.' }
        ]
      },
      {
        clienteAbertura: 'Ana: "Ah, acho que uns 2.500 por mês dá pra encaixar numa boa. E aí, dá pra usar FGTS nisso?"',
        clienteSeFracoAntes: 'Ana: "Enfim, sobre o FGTS, dá pra usar ou não?"',
        opcoes: [
          { texto: 'Isso o site trata na seção de dúvidas, mas pro detalhe certo do uso de vocês, o ideal é a gente ver isso com uma pessoa no WhatsApp, que confirma o que se aplica ao caso de vocês.', qualidade: 'ideal', pontos: 3,
            feedback: 'Não inventa regra de FGTS (área sensível) e encaminha certo pro canal certo — resposta segura e correta.' },
          { texto: 'Acho que dá, mas não tenho certeza dos detalhes exatos, posso confirmar depois.', qualidade: 'ok', pontos: 1,
            feedback: 'Admite incerteza, o que é honesto, mas "acho que dá" ainda é um chute que pode criar expectativa errada.' },
          { texto: 'Dá sim, todo mundo usa o FGTS nessa faixa de valor sem problema.', qualidade: 'fraca', pontos: -1,
            feedback: 'Afirma uma regra de FGTS sem confirmação — o tipo de informação que pode estar errada pro caso específico deles.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Ana: "Perfeito, adorei como você explicou tudo com calma, vamos falar no WhatsApp então!"',
      ok: 'Ana: "Ah, tá bom, confirma isso pra mim depois, tá?"',
      fraco: 'Ana: "Hmm, fiquei com mais dúvida ainda do que antes, será que não tem outra pessoa pra explicar melhor?"'
    }
  },

  {
    id: 'imovel-objecao-tempo-sorteio', produto: 'imovel', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"E se eu não for sorteado por anos?"',
    resumo: 'Thiago mora de aluguel, tem pressa, e teme ficar anos pagando sem ser contemplado.',
    objetivo: 'Ser honesto que não existe prazo garantido de contemplação, sem fugir da objeção nem inventar expectativa.',
    turnos: [
      {
        clienteAbertura: 'Thiago: "Eu moro de aluguel e tenho pressa. E se eu ficar anos pagando e nunca for sorteado?"',
        opcoes: [
          { texto: 'Entendo a pressa, é uma preocupação super válida morando de aluguel. Posso te explicar como funciona a contemplação de verdade, sem enrolação?', qualidade: 'ideal', pontos: 3,
            feedback: 'Valida a ansiedade dele com empatia genuína e pede espaço pra explicar com honestidade.' },
          { texto: 'Geralmente não demora tanto assim, não precisa se preocupar.', qualidade: 'ok', pontos: 1,
            feedback: 'Tenta tranquilizar com uma generalização sem base, o que pode virar expectativa perigosa.' },
          { texto: 'Relaxa, a maioria é contemplada rapidinho, é raro demorar muito.', qualidade: 'fraca', pontos: -1,
            feedback: 'Cria uma expectativa de prazo que ninguém pode garantir — arriscado logo na primeira resposta.' }
        ]
      },
      {
        clienteAbertura: 'Thiago: "Pode, explica."',
        clienteSeFracoAntes: 'Thiago: "Então me dá uma ideia, quanto tempo em média demora?"',
        opcoes: [
          { texto: 'Sendo bem direto: contemplação é por sorteio ou lance, e ninguém pode prever quando ocorre, nem eu nem a administradora. O que existe é uma estratégia baseada em probabilidade — a gente analisa o histórico de contemplação do grupo, o comportamento dos lances, e revisa isso a cada assembleia, que acontece uma vez por mês.', qualidade: 'ideal', pontos: 3,
            feedback: 'Não dá nenhum prazo (evita a promessa proibida) e ainda assim mostra que existe um trabalho ativo por trás.' },
          { texto: 'Não tem um prazo fixo, mas trabalhamos pra acelerar isso o máximo possível.', qualidade: 'ok', pontos: 1,
            feedback: 'Não promete prazo, o que é certo, mas fica vago sobre o que realmente é feito — não menciona estratégia nem assembleia.' },
          { texto: 'Pela nossa experiência, a maioria é contemplada em até 2 anos, mais ou menos.', qualidade: 'fraca', pontos: -1,
            feedback: 'Isso é exatamente o tipo de estimativa de prazo que nunca deveria ser dita — ninguém pode garantir isso.' }
        ]
      },
      {
        clienteAbertura: 'Thiago: "Entendi, pelo menos não é sorte pura, tem uma estratégia por trás. Ainda fico meio ansioso, mas ok."',
        clienteSeFracoAntes: 'Thiago: "Isso não me deixa muito tranquilo, sinceramente."',
        opcoes: [
          { texto: 'Faz todo sentido continuar ansioso, é uma decisão importante. O que eu posso garantir é acompanhamento de perto, revisando a estratégia com você a cada assembleia — quer que eu te mostre o histórico de contemplação de um grupo real pra você ver como isso funciona na prática?', qualidade: 'ideal', pontos: 3,
            feedback: 'Não tenta eliminar a ansiedade dele à força, reconhece que é legítima, e oferece algo concreto como próximo passo.' },
          { texto: 'Entendo, mas com o tempo você vai ver que vale a pena, a maioria fica satisfeito.', qualidade: 'ok', pontos: 1,
            feedback: 'Tenta convencer com uma generalização social em vez de mostrar algo concreto.' },
          { texto: 'Não fica ansioso não, vai dar tudo certo, confia em mim.', qualidade: 'fraca', pontos: -1,
            feedback: 'Frase vazia que soa como garantia informal — o tipo de promessa que a Astro nunca deveria fazer.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Thiago: "Isso ajuda, quero ver esse histórico sim, manda pra mim."',
      ok: 'Thiago: "Tá, vou pensar melhor sobre isso ainda."',
      fraco: 'Thiago: "Ainda não me convenceu, vou continuar pesquisando outras opções."'
    }
  },

  {
    id: 'imovel-fechamento-dois-grupos', produto: 'imovel', etapa: 'fechamento', dificuldade: 'medio',
    titulo: 'Pronto para fechar mas hesita entre dois grupos',
    resumo: 'Fernanda já decidiu entrar no consórcio de imóvel, mas está insegura entre dois grupos com características diferentes.',
    objetivo: 'Mostrar que a escolha do grupo passa por histórico de contemplação e saúde do grupo, não só a parcela.',
    turnos: [
      {
        clienteAbertura: 'Fernanda: "Já decidi comprar via consórcio, só fiquei em dúvida entre os dois grupos que você me mostrou. Qual a diferença de verdade, além da parcela?"',
        opcoes: [
          { texto: 'Ótima pergunta. A diferença real não tá só na parcela — envolve o histórico de contemplação de cada grupo, o comportamento dos lances e a saúde geral do grupo. Posso te mostrar isso dos dois pra você comparar?', qualidade: 'ideal', pontos: 3,
            feedback: 'Vai direto ao ponto certo (histórico, lances, saúde do grupo) e oferece mostrar de forma concreta.' },
          { texto: 'Esse aqui que eu te mostrei primeiro costuma ser melhor.', qualidade: 'ok', pontos: 1,
            feedback: 'Dá uma recomendação sem explicar o porquê — ela mesma vai notar que faltou justificativa.' },
          { texto: 'Na prática as duas são bem parecidas, pode escolher qualquer uma.', qualidade: 'fraca', pontos: -1,
            feedback: 'Diz que não faz diferença quando na verdade a escolha do grupo é uma etapa importante do processo.' }
        ]
      },
      {
        clienteAbertura: 'Fernanda: "Pode sim, quero entender isso."',
        clienteSeFracoAntes: 'Fernanda: "Mas por quê exatamente? Me explica melhor."',
        opcoes: [
          { texto: 'O grupo A tem um histórico de contemplação mais consistente e lances mais previsíveis; o grupo B é mais novo, então tem menos histórico pra analisar ainda. Esse é o tipo de análise que a gente faz antes de indicar, revisando a cada assembleia.', qualidade: 'ideal', pontos: 3,
            feedback: 'Traz um critério real e específico de comparação (histórico, previsibilidade, tempo do grupo) em vez de uma resposta genérica.' },
          { texto: 'Um tem mais gente conhecida contemplada, o outro é mais novo no mercado.', qualidade: 'ok', pontos: 1,
            feedback: 'Menciona uma diferença real mas de forma solta, sem conectar com o processo de análise da Astro.' },
          { texto: 'Comercialmente esse aqui dá uma condição melhor pra mim fechar com você, mas tanto faz pra você.', qualidade: 'fraca', pontos: -1,
            feedback: 'Revela um interesse do próprio vendedor na escolha, o que quebra completamente a confiança dela no processo.' }
        ]
      },
      {
        clienteAbertura: 'Fernanda: "Ah, agora ficou claro, vou com o grupo A então. Antes de assinar, posso ver o contrato completo?"',
        clienteSeFracoAntes: 'Fernanda: "Tá, mas antes de decidir, posso ver o contrato completo?"',
        opcoes: [
          { texto: 'Claro, o contrato é entre você e a administradora — ele é enviado completo por e-mail, com acesso ao portal dela, e você pode consultar a administradora no site do Banco Central antes de assinar qualquer coisa.', qualidade: 'ideal', pontos: 3,
            feedback: 'Confirma exatamente o processo real (contrato com a administradora, envio completo, consulta no Banco Central) — resposta transparente e correta.' },
          { texto: 'Sim, você recebe o contrato depois de fechar.', qualidade: 'ok', pontos: 1,
            feedback: 'Não erra, mas fica vago sobre quando e como ela pode revisar antes de decidir de verdade.' },
          { texto: 'Pode ver sim, mas isso é só formalidade, o importante é já garantir sua vaga no grupo agora.', qualidade: 'fraca', pontos: -1,
            feedback: 'Trata a revisão do contrato como "só formalidade" e ainda cria pressão pra decidir rápido — vai contra a transparência que ela está pedindo.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Fernanda: "Perfeito, agora sim me sinto segura pra assinar."',
      ok: 'Fernanda: "Tá, acho que fecho, mas ainda vou reler tudo com calma."',
      fraco: 'Fernanda: "Isso me deixou insegura, vou conversar com outra pessoa antes de decidir."'
    }
  },

  {
    id: 'carro-objecao-guardar-dinheiro', produto: 'carro', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"Prefiro guardar o dinheiro e comprar à vista depois"',
    resumo: 'Larissa prefere guardar dinheiro todo mês numa poupança/CDB e comprar o carro à vista quando juntar o valor todo.',
    objetivo: 'Não prometer que o consórcio rende mais que investir (isso é consultoria financeira, não é papel do vendedor) — mostrar a vantagem real: disciplina do compromisso mensal e a chance de contemplação antes de juntar 100% sozinha.',
    turnos: [
      {
        clienteAbertura: 'Larissa: "Eu prefiro guardar esse dinheiro numa poupança e comprar o carro à vista quando juntar tudo. Por que eu pagaria uma taxa de administração à toa?"',
        opcoes: [
          { texto: 'Faz muito sentido guardar dinheiro, é uma disciplina ótima. Só uma pergunta: hoje, guardando por conta, você consegue manter esse valor todo mês sem mexer nele por nenhum motivo?', qualidade: 'ideal', pontos: 3,
            feedback: 'Valida a estratégia dela sem desqualificar investir, e traz a pergunta certa: disciplina é o ponto real, não rentabilidade — evita entrar em terreno de consultoria financeira.' },
          { texto: 'O consórcio no fim das contas rende mais que a poupança, compensa mais.', qualidade: 'ok', pontos: 1,
            feedback: 'Isso é uma comparação de rentabilidade que o vendedor não pode fazer — consórcio não é produto de investimento, e essa afirmação pode ser falsa dependendo do caso dela.' },
          { texto: 'Poupança rende muito pouco hoje em dia, praticamente perde pra inflação, é bobagem guardar lá.', qualidade: 'fraca', pontos: -1,
            feedback: 'Entra em consultoria de investimento, desqualificando outro produto financeiro — não é papel do vendedor e pode ser uma informação incorreta.' }
        ]
      },
      {
        clienteAbertura: 'Larissa: "Confesso que às vezes uso uma parte pra outras coisas no meio do caminho."',
        clienteSeFracoAntes: 'Larissa: "Isso não vem ao caso, eu quero saber por que pagar taxa então."',
        opcoes: [
          { texto: 'É mais comum do que parece — o valor guardado por conta acaba sendo usado pra outras coisas no meio do caminho. No consórcio, o compromisso mensal é contratual, o que ajuda a manter a disciplina até o fim. E não tem juros de financiamento, só a taxa de administração diluída no seu lugar.', qualidade: 'ideal', pontos: 3,
            feedback: 'Usa a vantagem real do consórcio (disciplina contratual) sem inventar nada sobre rentabilidade — argumento honesto e forte.' },
          { texto: 'Entendo, mas no consórcio isso não acontece, você é obrigada a pagar.', qualidade: 'ok', pontos: 1,
            feedback: 'Não erra, mas soa mais como pressão do que como benefício genuíno de disciplina.' },
          { texto: 'Isso mesmo, e além disso a taxa de administração é bem menor que qualquer imposto que incide sobre investimento.', qualidade: 'fraca', pontos: -1,
            feedback: 'Compara com tributação de investimentos sem nenhum dado real — outra afirmação de consultoria financeira sem base.' }
        ]
      },
      {
        clienteAbertura: 'Larissa: "Entendi, faz sentido a questão da disciplina. Mas e se eu for sorteada rápido, eu já compro o carro sem ter juntado tudo?"',
        clienteSeFracoAntes: 'Larissa: "Tá, mas e a rentabilidade, isso eu não posso simplesmente calcular sozinha?"',
        opcoes: [
          { texto: 'Exatamente, essa é a outra vantagem: se você for contemplada por sorteio ou lance, tem acesso ao crédito antes de ter guardado 100% sozinha — sem prazo garantido, claro, mas é uma chance real. Já a parte de rentabilidade e comparação com investimento, isso é bom avaliar com quem cuida disso pra você, eu não posso opinar tecnicamente.', qualidade: 'ideal', pontos: 3,
            feedback: 'Explica a vantagem real (contemplação antecipada) com honestidade sobre a falta de garantia de prazo, e reconhece o limite do que pode opinar sobre investimento.' },
          { texto: 'Isso, você pode ser sorteada rápido e já sair com o carro.', qualidade: 'ok', pontos: 1,
            feedback: 'Fica perto de sugerir uma expectativa de prazo, sem reforçar que não há garantia nenhuma disso.' },
          { texto: 'Isso, e olha, particularmente eu acho que compensa muito mais que ficar guardando, é só fazer as contas.', qualidade: 'fraca', pontos: -1,
            feedback: 'Dá uma opinião pessoal de que compensa financeiramente mais, o que soa como consultoria de investimento disfarçada.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Larissa: "Faz sentido, gostei da parte da disciplina. Vou pensar com mais calma agora."',
      ok: 'Larissa: "Tá, ainda tô meio em dúvida entre as duas opções."',
      fraco: 'Larissa: "Acho que prefiro continuar guardando por conta mesmo, mais seguro."'
    }
  },

  {
    id: 'carro-objecao-dinheiro-preso', produto: 'carro', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"E se eu precisar desse dinheiro numa emergência?"',
    resumo: 'Vinícius tem receio de comprometer dinheiro todo mês num consórcio e não poder usar esse valor se precisar numa emergência.',
    objetivo: 'Ser honesto sobre o compromisso contratual do consórcio, sem inventar facilidades que não existem, e ajudar a dimensionar a parcela dentro do que realmente sobra.',
    turnos: [
      {
        clienteAbertura: 'Vinícius: "Minha preocupação é essa: se eu comprometo uma parcela todo mês, e se eu precisar desse dinheiro numa emergência? Fica preso, não é?"',
        opcoes: [
          { texto: 'Boa pergunta, e prefiro ser honesto: a parcela do consórcio é um compromisso mensal, não é como ter o dinheiro guardado que você resgata a qualquer hora. Por isso é importante definirmos uma parcela que caiba tranquilo no seu orçamento, sem comprometer sua reserva de emergência.', qualidade: 'ideal', pontos: 3,
            feedback: 'Responde com honestidade real em vez de minimizar, e já direciona pro que importa: dimensionar a parcela certa.' },
          { texto: 'Em caso de emergência, dá pra usar o FGTS ou vender a cota, tem várias saídas.', qualidade: 'ok', pontos: 1,
            feedback: 'Menciona possibilidades sem confirmar se de fato se aplicam ao caso dele nem explicar como funcionam de verdade — pode criar expectativa errada.' },
          { texto: 'Não, imagina, é super fácil sacar esse dinheiro de volta quando você quiser.', qualidade: 'fraca', pontos: -1,
            feedback: 'Isso é falso — o consórcio não é resgatável como uma poupança, essa afirmação pode gerar um problema sério de confiança depois.' }
        ]
      },
      {
        clienteAbertura: 'Vinícius: "Ah, entendi, faz sentido calcular certinho então. Hoje eu tenho uma reserva separada, seria tipo isso mesmo?"',
        clienteSeFracoAntes: 'Vinícius: "Então quer dizer que realmente fica preso, isso me deixa inseguro."',
        opcoes: [
          { texto: 'Isso mesmo, ótimo você já ter uma reserva separada — ela continua sendo sua rede de segurança, intocada. A parcela do consórcio entra como um compromisso à parte, dentro do que sobra sem mexer nessa reserva.', qualidade: 'ideal', pontos: 3,
            feedback: 'Reforça a separação clara entre reserva de emergência e parcela do consórcio — orientação responsável, sem inventar solução mágica.' },
          { texto: 'Isso, o importante é você ter uma reserva à parte pra imprevistos.', qualidade: 'ok', pontos: 1,
            feedback: 'Correto mas genérico — não conecta com o fato de ele já ter uma reserva, perde a chance de reforçar especificamente o caso dele.' },
          { texto: 'Fica tranquilo, se precisar a gente sempre dá um jeito de resolver pra você.', qualidade: 'fraca', pontos: -1,
            feedback: 'Promessa vaga e sem base — sugere uma flexibilidade que não existe de verdade no contrato.' }
        ]
      },
      {
        clienteAbertura: 'Vinícius: "Tá bom, então vamos calcular uma parcela que não mexa nessa minha reserva."',
        clienteSeFracoAntes: 'Vinícius: "Tá, mas ainda tô com um pé atrás com esse compromisso."',
        opcoes: [
          { texto: 'Perfeito, vamos montar a simulação com uma parcela que sobre confortável sem tocar na sua reserva — assim você entra tranquilo, sabendo exatamente no que está se comprometendo.', qualidade: 'ideal', pontos: 3,
            feedback: 'Fecha reforçando transparência total sobre o compromisso — a base de uma decisão consciente, não empurrada.' },
          { texto: 'Tá bom, vou te passar uma simulação então.', qualidade: 'ok', pontos: 1,
            feedback: 'Cumpre o combinado, mas perde a chance de reforçar a transparência que ele estava buscando.' },
          { texto: 'Sem crise, é só uma parcelinha, no fim das contas nem vai fazer diferença no seu orçamento.', qualidade: 'fraca', pontos: -1,
            feedback: 'Minimiza uma preocupação legítima dele com um comentário vago que pode soar como desrespeito à cautela dele.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Vinícius: "Gostei da transparência, vamos ver essa simulação então."',
      ok: 'Vinícius: "Tá, manda aí, mas ainda vou pensar bem."',
      fraco: 'Vinícius: "Ainda tô inseguro com esse compromisso, vou esperar mais um pouco."'
    }
  },

  {
    id: 'moto-objecao-desistencia', produto: 'moto', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"Se eu desistir, recebo tudo de volta rapidinho?"',
    resumo: 'Camila pergunta se pode desistir do consórcio quando quiser e recuperar o que já pagou, antes de se comprometer.',
    objetivo: 'Explicar com honestidade como funciona a saída de um grupo, sem inventar regras favoráveis que não existem.',
    turnos: [
      {
        clienteAbertura: 'Camila: "Antes de entrar, quero saber: se eu desistir no meio do caminho, eu recebo de volta tudo que paguei, rapidinho?"',
        opcoes: [
          { texto: 'Pergunta importante de fazer antes de entrar. Vou ser direta: desistir não é como cancelar uma assinatura — envolve as regras do grupo e da administradora, e não é uma devolução imediata do valor total. Prefiro te explicar isso com clareza agora do que você descobrir depois.', qualidade: 'ideal', pontos: 3,
            feedback: 'Responde com honestidade total antes da venda — evita criar uma falsa expectativa que geraria decepção grave lá na frente.' },
          { texto: 'Dá pra desistir sim, mas tem um processo pra reaver o valor.', qualidade: 'ok', pontos: 1,
            feedback: 'Não é falso, mas fica vago sobre o que realmente esse processo envolve — ela pode continuar com uma expectativa incompleta.' },
          { texto: 'Sim, é tranquilo, você pede e recebe de volta rapidinho, sem complicação.', qualidade: 'fraca', pontos: -1,
            feedback: 'Isso não é verdade — passar essa expectativa pode gerar um problema sério de confiança se ela realmente desistir um dia.' }
        ]
      },
      {
        clienteAbertura: 'Camila: "Ah, entendi, é bom saber isso antes. Como funciona então, mais ou menos?"',
        clienteSeFracoAntes: 'Camila: "Então quer dizer que eu não tenho controle sobre meu próprio dinheiro?"',
        opcoes: [
          { texto: 'Você tem, sim — é o seu dinheiro, mas ele está dentro de uma lógica de grupo, regida pela Lei 11.795 e fiscalizada pelo Banco Central. Isso significa que a saída segue regras contratuais específicas da administradora, e não é algo que eu consigo detalhar de cabeça com precisão — mas dá pra te mostrar isso por escrito no contrato antes de você decidir.', qualidade: 'ideal', pontos: 3,
            feedback: 'Reconhece a preocupação legítima dela, ancora na regulação real e é honesto sobre não improvisar detalhes contratuais.' },
          { texto: 'É porque o dinheiro fica dentro do grupo, não é uma conta individual sua.', qualidade: 'ok', pontos: 1,
            feedback: 'Explica uma parte real do mecanismo, mas de um jeito que pode soar alarmante sem o contexto da regulação por trás.' },
          { texto: 'Calma, isso quase nunca vira problema, a maioria nunca desiste mesmo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desvia da pergunta real dela com uma estatística inventada, em vez de explicar o mecanismo com honestidade.' }
        ]
      },
      {
        clienteAbertura: 'Camila: "Tá, faz sentido, posso ver isso no contrato antes de decidir então?"',
        clienteSeFracoAntes: 'Camila: "Tá, isso me deixou insegura, sinceramente."',
        opcoes: [
          { texto: 'Com certeza, você recebe o contrato completo por e-mail antes de qualquer compromisso, com acesso ao portal da administradora — assim você lê com calma essa parte específica antes de decidir qualquer coisa.', qualidade: 'ideal', pontos: 3,
            feedback: 'Reforça transparência total com o processo real — exatamente o que dá segurança de verdade, sem prometer nada além disso.' },
          { texto: 'Sim, você recebe o contrato depois, mas essa parte específica eu não sei de cabeça.', qualidade: 'ok', pontos: 1,
            feedback: 'Confirma que ela vai ver o contrato, mas admite não saber a resposta específica sem redirecionar pra uma fonte concreta agora.' },
          { texto: 'Relaxa, isso é só um detalhe pequeno, o importante é você aproveitar as vantagens do consórcio.', qualidade: 'fraca', pontos: -1,
            feedback: 'Minimiza uma dúvida legítima e tenta desviar o foco — justo o oposto da transparência que constrói confiança.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Camila: "Gostei da sua honestidade, quero ver o contrato antes de decidir mesmo."',
      ok: 'Camila: "Tá, vou aguardar o contrato pra entender melhor."',
      fraco: 'Camila: "Isso me deixou insegura, vou pensar bastante antes de continuar."'
    }
  },

  {
    id: 'agro-objecao-compra-a-vista', produto: 'agro', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"A safra foi boa, por que não comprar à vista?"',
    resumo: 'Dona Marlene, produtora rural, recebeu um bom valor pela safra e está pensando em comprar um trator usado à vista em vez de entrar num consórcio.',
    objetivo: 'Reconhecer que comprar à vista tem vantagens reais, sem desqualificar, mostrando quando o consórcio dá acesso a um bem melhor sem comprometer todo o capital de giro.',
    turnos: [
      {
        clienteAbertura: 'Dona Marlene: "A safra foi boa esse ano, dá pra eu comprar um trator usado à vista direto. Por que eu entraria num consórcio?"',
        opcoes: [
          { texto: 'Que bom que a safra foi boa! Só uma pergunta antes: esse trator usado já é o equipamento ideal pra sua produção, ou seria mais uma solução de momento pra não comprometer o capital da safra?', qualidade: 'ideal', pontos: 3,
            feedback: 'Reconhece a conquista dela e faz a pergunta certa: entender se está abrindo mão do equipamento ideal só pra resolver rápido.' },
          { texto: 'Com consórcio você consegue um trator novo sem gastar tudo de uma vez.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa, mas afirma antes de entender a real necessidade dela — pula a qualificação.' },
          { texto: 'Trator usado dá muito problema, não vale a pena, é melhor sempre comprar novo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desqualifica a decisão dela sem conhecer o equipamento específico — presunçoso e sem embasamento técnico do vendedor.' }
        ]
      },
      {
        clienteAbertura: 'Dona Marlene: "Na verdade eu queria mesmo um modelo mais novo, com mais potência pra área que expandi."',
        clienteSeFracoAntes: 'Dona Marlene: "Olha, eu só quero resolver isso rápido com o dinheiro que já tenho em mãos."',
        opcoes: [
          { texto: 'Entendo a vontade de resolver rápido. Uma forma de pensar: usando parte do valor da safra como lance num consórcio pro modelo mais novo que você realmente precisa, você não compromete todo o capital de giro de uma vez — e ainda concorre à contemplação por sorteio ou lance.', qualidade: 'ideal', pontos: 3,
            feedback: 'Conecta o capital disponível como lance (sem comprometer o giro) com a necessidade real dela, sem prometer prazo.' },
          { texto: 'Faz sentido, com consórcio você não usa todo o capital de giro de uma vez.', qualidade: 'ok', pontos: 1,
            feedback: 'Correto, mas genérico — não conecta com o que ela especificamente precisa nem com o uso do valor da safra como lance.' },
          { texto: 'Isso, é arriscado usar todo o dinheiro da safra numa compra só, guarda uma parte.', qualidade: 'fraca', pontos: -1,
            feedback: 'Dá conselho financeiro sobre como ela deve gerir o capital da propriedade — não é papel do vendedor opinar sobre isso.' }
        ]
      },
      {
        clienteAbertura: 'Dona Marlene: "Interessante, não tinha pensado em usar como lance. Como fica isso pra mim ver os números?"',
        clienteSeFracoAntes: 'Dona Marlene: "Tá, mas eu ainda acho que à vista resolve mais rápido, sem enrolação."',
        opcoes: [
          { texto: 'Faz sentido eu te mostrar uma simulação com esse valor como lance, pra você comparar lado a lado com a opção à vista do trator usado e decidir com números reais na mão — sem compromisso nenhum.', qualidade: 'ideal', pontos: 3,
            feedback: 'Propõe o próximo passo certo (simulação comparativa) sem forçar a decisão — deixa ela decidir com informação concreta.' },
          { texto: 'Bom, vou te passar informações gerais sobre como funciona o lance.', qualidade: 'ok', pontos: 1,
            feedback: 'Vago — ela já demonstrou interesse concreto no modelo mais novo e merece uma proposta mais específica.' },
          { texto: 'Você tem razão, à vista realmente resolve mais rápido, mas o consórcio no fim compensa muito mais financeiramente.', qualidade: 'fraca', pontos: -1,
            feedback: 'Concorda que à vista é mais rápido mas ainda assim afirma vantagem financeira sem comparação real.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Dona Marlene: "Show, manda essa simulação, quero ver os números com calma."',
      ok: 'Dona Marlene: "Tá, me manda informação que eu vejo depois."',
      fraco: 'Dona Marlene: "Acho que vou mesmo comprar o usado à vista, resolve mais rápido pra mim."'
    }
  },

  {
    id: 'imovel-objecao-compra-a-vista', produto: 'imovel', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"Recebi uma herança, por que não comprar à vista?"',
    resumo: 'Sr. Eduardo recebeu uma herança e está considerando comprar um imóvel menor à vista agora, em vez de entrar num consórcio para um imóvel melhor.',
    objetivo: 'Reconhecer honestamente quando comprar à vista pode fazer sentido, sem desqualificar, e mostrar quando o consórcio amplia o poder de compra sem abrir mão de liquidez.',
    turnos: [
      {
        clienteAbertura: 'Sr. Eduardo: "Recebi uma herança, dá pra comprar um apartamento menor à vista agora mesmo. Por que eu entraria num consórcio?"',
        opcoes: [
          { texto: 'Que ótimo poder considerar isso à vista. Só pra te ajudar a decidir com clareza: esse apartamento menor à vista já é o que você realmente quer, ou seria um meio-termo pra não usar consórcio?', qualidade: 'ideal', pontos: 3,
            feedback: 'Não desqualifica comprar à vista, e faz a pergunta certa pra entender se ele está abrindo mão do imóvel que realmente quer só pra evitar o consórcio.' },
          { texto: 'Com consórcio você consegue um imóvel melhor sem gastar tudo de uma vez.', qualidade: 'ok', pontos: 1,
            feedback: 'Direção certa, mas afirma antes de entender o que ele realmente quer — pula a qualificação.' },
          { texto: 'Comprar à vista não é uma boa ideia, você fica sem nenhuma reserva depois.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desqualifica a decisão dele sem saber o contexto completo — presunçoso.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Eduardo: "Na verdade eu queria um apartamento maior, mas achei que à vista era o caminho mais rápido."',
        clienteSeFracoAntes: 'Sr. Eduardo: "Olha, eu só quero resolver isso rápido e sem burocracia, é isso."',
        opcoes: [
          { texto: 'Entendo a vontade de resolver rápido. Uma forma de pensar: usando parte da herança como lance num consórcio pro apartamento maior que você quer, você mantém uma reserva livre e ainda concorre à contemplação por sorteio ou lance — sem os juros de um financiamento se precisasse complementar de outro jeito.', qualidade: 'ideal', pontos: 3,
            feedback: 'Conecta a herança como lance (uso inteligente do capital) com o objetivo real dele, sem prometer prazo e sem desqualificar a alternativa à vista.' },
          { texto: 'Faz sentido, com consórcio você não usa todo o dinheiro de uma vez.', qualidade: 'ok', pontos: 1,
            feedback: 'Correto, mas genérico — não conecta com o que ele especificamente quer nem com o uso da herança como lance.' },
          { texto: 'Isso, é melhor não usar toda a herança de uma vez, guarda uma parte pra você mesmo.', qualidade: 'fraca', pontos: -1,
            feedback: 'Dá conselho financeiro pessoal sobre como ele deve usar a herança — não é papel do vendedor opinar sobre isso.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Eduardo: "Interessante, não tinha pensado em usar como lance. Como que funciona pra eu ver os números?"',
        clienteSeFracoAntes: 'Sr. Eduardo: "Tá, mas eu ainda acho que à vista resolve mais rápido, sem enrolação."',
        opcoes: [
          { texto: 'Faz sentido eu te mostrar uma simulação com esse valor como lance, pra você comparar lado a lado com a opção à vista e decidir com números reais na mão — sem compromisso nenhum.', qualidade: 'ideal', pontos: 3,
            feedback: 'Propõe o próximo passo certo (simulação comparativa) sem forçar a decisão — deixa ele decidir com informação concreta.' },
          { texto: 'Bom, vou te passar informações gerais sobre como funciona o lance.', qualidade: 'ok', pontos: 1,
            feedback: 'Vago — ele já demonstrou interesse concreto e merece uma proposta de próximo passo mais específica.' },
          { texto: 'Você tem razão, à vista realmente é mais rápido, mas o consórcio no fim compensa mais financeiramente.', qualidade: 'fraca', pontos: -1,
            feedback: 'Concorda que à vista é mais rápido mas ainda assim afirma vantagem financeira sem comparação real — inconsistente e sem base.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Sr. Eduardo: "Show, manda essa simulação, quero ver os números com calma."',
      ok: 'Sr. Eduardo: "Tá, me manda informação que eu vejo depois."',
      fraco: 'Sr. Eduardo: "Acho que vou mesmo pelo caminho mais direto e comprar à vista."'
    }
  },

  {
    id: 'imovel-objecao-guardar-dinheiro', produto: 'imovel', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"Vou juntar dinheiro e comprar à vista daqui uns anos"',
    resumo: 'Sr. Márcio prefere guardar dinheiro investindo mês a mês e comprar o imóvel à vista só quando juntar o valor total.',
    objetivo: 'Não prometer rentabilidade nem comparar com investimento — mostrar a vantagem real: disciplina do compromisso e chance de contemplação antes de juntar tudo sozinho.',
    turnos: [
      {
        clienteAbertura: 'Sr. Márcio: "Prefiro juntar dinheiro investindo e comprar o imóvel à vista daqui uns anos, quando tiver o valor todo. Assim não pago taxa de administração à toa."',
        opcoes: [
          { texto: 'Faz sentido como estratégia de guardar dinheiro. Posso te perguntar uma coisa importante: nesse tempo que você levaria pra juntar o valor todo, o preço desse imóvel tende a ficar parado, ou ele também sobe com o tempo?', qualidade: 'ideal', pontos: 3,
            feedback: 'Traz uma reflexão honesta e real (valorização do imóvel ao longo do tempo) sem inventar percentual nenhum — deixa ele mesmo concluir o raciocínio.' },
          { texto: 'O consórcio compensa mais porque o imóvel só vai ficar mais caro enquanto você guarda dinheiro.', qualidade: 'ok', pontos: 1,
            feedback: 'A ideia é válida, mas afirma como fato garantido sem deixar ele refletir, e sem nenhum dado concreto por trás.' },
          { texto: 'Investir hoje em dia não rende quase nada, é melhor nem tentar guardar, entra logo no consórcio.', qualidade: 'fraca', pontos: -1,
            feedback: 'Desqualifica investir sem embasamento nenhum — consultoria de investimento que não é papel do vendedor.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Márcio: "Verdade, imóvel sempre tende a subir de preço, isso é um ponto."',
        clienteSeFracoAntes: 'Sr. Márcio: "Isso eu não sei te dizer, mas mesmo assim prefiro juntar sozinho."',
        opcoes: [
          { texto: 'Exatamente, esse é um ponto real pra considerar. E tem outra coisa: guardando por conta, muita gente acaba usando parte do dinheiro no meio do caminho pra outras coisas. No consórcio, o compromisso mensal é contratual, o que ajuda a manter a disciplina até o fim, sem os juros de um financiamento.', qualidade: 'ideal', pontos: 3,
            feedback: 'Soma dois argumentos reais e honestos (valorização do imóvel + disciplina contratual) sem inventar número de rentabilidade nenhum.' },
          { texto: 'É, e além disso no consórcio você não corre o risco de gastar esse dinheiro com outra coisa.', qualidade: 'ok', pontos: 1,
            feedback: 'Argumento válido mas colocado de forma solta, sem conectar com o que ele acabou de reconhecer sobre valorização.' },
          { texto: 'Isso, e fora que investimento hoje não bate nem perto da valorização de imóvel, então sai perdendo guardando.', qualidade: 'fraca', pontos: -1,
            feedback: 'Faz uma comparação numérica implícita entre investimento e valorização imobiliária sem nenhum dado real — terreno de consultoria financeira.' }
        ]
      },
      {
        clienteAbertura: 'Sr. Márcio: "Faz sentido, nunca tinha pensado por esse lado. E se eu for contemplado rápido, adianta isso tudo?"',
        clienteSeFracoAntes: 'Sr. Márcio: "Tá, mas e se eu nunca for sorteado, não saio perdendo tempo assim?"',
        opcoes: [
          { texto: 'Se você for contemplado por sorteio ou lance, sim, você tem acesso ao crédito antes de ter juntado tudo sozinho — mas não existe prazo garantido pra isso, ser sincero é importante. O que dá pra garantir é uma estratégia baseada em probabilidade, revisada a cada assembleia, em vez de só esperar parado.', qualidade: 'ideal', pontos: 3,
            feedback: 'Responde com honestidade total, sem prometer prazo, e reforça que existe um trabalho ativo por trás — a resposta mais correta possível pra essa pergunta.' },
          { texto: 'Isso, você pode ser contemplado rápido e sair na frente de quem tá juntando sozinho.', qualidade: 'ok', pontos: 1,
            feedback: 'Sugere uma vantagem de tempo sem deixar claro que não há garantia nenhuma de prazo.' },
          { texto: 'Com certeza, é bem raro alguém esperar muito tempo, geralmente sai rapidinho.', qualidade: 'fraca', pontos: -1,
            feedback: 'Cria uma expectativa de prazo curto que ninguém pode garantir — exatamente o tipo de promessa proibida.' }
        ]
      }
    ],
    desfechos: {
      otimo: 'Sr. Márcio: "Isso abriu minha cabeça, principalmente a parte da valorização. Vou repensar."',
      ok: 'Sr. Márcio: "Tá, ainda vou pensar melhor sobre isso."',
      fraco: 'Sr. Márcio: "Acho que ainda prefiro juntar sozinho, me sinto mais seguro assim."'
    }
  }

];

window.PRODUTOS_TREINO = {
  carro:  { nome: 'Carro',              emoji: '🚗' },
  moto:   { nome: 'Moto',               emoji: '🏍️' },
  agro:   { nome: 'Maquinário agrícola', emoji: '🚜' },
  imovel: { nome: 'Imóveis',            emoji: '🏠' }
};

window.ETAPAS_TREINO = {
  prospeccao:   'Prospecção',
  qualificacao: 'Qualificação',
  apresentacao: 'Apresentação',
  objecoes:     'Objeções',
  fechamento:   'Fechamento',
  posvenda:     'Pós-venda'
};
