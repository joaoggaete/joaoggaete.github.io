/* ============================================================================
   METADADOS PÚBLICOS DOS CENÁRIOS (visíveis no navegador)
   Só o necessário para montar a lista de escolha. O roteiro completo de cada
   personagem fica em netlify/functions/treino-cenarios.js, do lado do
   servidor — assim quem treina não lê o "gabarito" antes de praticar.
   Os ids aqui precisam bater com os ids de lá.
   ========================================================================= */
window.CENARIOS_TREINO = [
  { id: 'carro-prospeccao-indicacao', produto: 'carro', etapa: 'prospeccao', dificuldade: 'dificil',
    titulo: 'Contato frio por indicação',
    resumo: 'Um cliente antigo passou o contato dela. Ela não pediu, está ocupada e não sabe direito por que está falando com você.',
    objetivo: 'Quebrar o gelo sem empurrar, despertar curiosidade genuína e conseguir avançar para uma qualificação.' },

  { id: 'carro-objecao-caro', produto: 'carro', etapa: 'objecoes', dificuldade: 'facil',
    titulo: '"Achei mais caro que financiamento"',
    resumo: 'Já entendeu a proposta, mas comparou por cima com um financiamento do banco e acha o consórcio mais caro.',
    objetivo: 'Explicar com clareza a diferença entre juros e taxa de administração, sem inventar número.' },

  { id: 'carro-posvenda-atraso', produto: 'carro', etapa: 'posvenda', dificuldade: 'dificil',
    titulo: 'Atrasou a parcela e quer desistir',
    resumo: 'Cliente já é consorciado há 8 meses, atrasou a parcela do mês passado e está pensando em desistir do grupo.',
    objetivo: 'Acolher sem julgar, esclarecer que o contrato é com a administradora, e manter o cliente no grupo.' },

  { id: 'moto-qualificacao-sem-orcamento', produto: 'moto', etapa: 'qualificacao', dificuldade: 'medio',
    titulo: 'Quer trocar de moto mas não sabe o orçamento',
    resumo: 'Jovem entusiasmado quer subir de categoria de moto, mas responde vago quando perguntam quanto pode pagar por mês.',
    objetivo: 'Fazer as perguntas certas de qualificação sem parecer interrogatório nem pular para o valor do crédito.' },

  { id: 'moto-objecao-golpe', produto: 'moto', etapa: 'objecoes', dificuldade: 'medio',
    titulo: '"Isso não é golpe?"',
    resumo: 'Já ouviu falar mal de consórcio e desconfia que seja uma armadilha.',
    objetivo: 'Responder a desconfiança com fatos verificáveis, sem ser condescendente nem prometer nada.' },

  { id: 'moto-fechamento-dois-prazos', produto: 'moto', etapa: 'fechamento', dificuldade: 'medio',
    titulo: 'Indeciso entre dois prazos de grupo',
    resumo: 'Já decidiu comprar, mas está travado entre parcela menor com prazo mais longo, ou o contrário.',
    objetivo: 'Ajudar a decidir com base no orçamento e no objetivo dele, sem empurrar a opção que fecha mais rápido.' },

  { id: 'agro-apresentacao-trator', produto: 'agro', etapa: 'apresentacao', dificuldade: 'medio',
    titulo: 'Trator novo: financiamento x consórcio',
    resumo: 'Produtor rural comparando financiamento agrícola tradicional com consórcio.',
    objetivo: 'Apresentar o consórcio como opção sem desqualificar o financiamento agrícola subsidiado.' },

  { id: 'agro-objecao-contador', produto: 'agro', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"Meu contador disse para financiar"',
    resumo: 'O contador recomendou financiamento pela dedutibilidade fiscal dos juros, e ele repete o argumento com convicção.',
    objetivo: 'Reconhecer o ponto sem entrar em disputa contábil, trazendo a conversa de volta ao que é seguro comparar.' },

  { id: 'agro-posvenda-lance-embutido', produto: 'agro', etapa: 'posvenda', dificuldade: 'medio',
    titulo: 'Contemplado, dúvida sobre lance embutido',
    resumo: 'Foi contemplado por sorteio, mas o crédito não fecha o valor da colheitadeira e está em dúvida sobre usar lance embutido.',
    objetivo: 'Explicar o que é lance embutido de forma que ele entenda o trade-off, sem decidir por ele.' },

  { id: 'imovel-qualificacao-primeiro-ape', produto: 'imovel', etapa: 'qualificacao', dificuldade: 'facil',
    titulo: 'Casal comprando o primeiro apartamento',
    resumo: 'Casal jovem, primeira compra de imóvel, animado mas com muitas perguntas básicas misturadas.',
    objetivo: 'Organizar as perguntas de qualificação sem sufocar o entusiasmo do casal.' },

  { id: 'imovel-objecao-tempo-sorteio', produto: 'imovel', etapa: 'objecoes', dificuldade: 'dificil',
    titulo: '"E se eu não for sorteado por anos?"',
    resumo: 'Mora de aluguel, tem pressa, e teme ficar anos pagando sem ser contemplado.',
    objetivo: 'Ser honesto que não existe prazo garantido de contemplação, sem fugir da objeção.' },

  { id: 'imovel-fechamento-dois-grupos', produto: 'imovel', etapa: 'fechamento', dificuldade: 'medio',
    titulo: 'Pronto para fechar mas hesita entre dois grupos',
    resumo: 'Já decidiu entrar no consórcio de imóvel, mas está inseguro entre dois grupos diferentes.',
    objetivo: 'Mostrar que a escolha do grupo passa por histórico de contemplação e saúde do grupo, não só a parcela.' }
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
