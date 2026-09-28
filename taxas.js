/* ==========================================================================
   TAXAS DE REFERÊNCIA — fonte única do site.
   Valores confirmados pelo João, dentro do que o mercado pratica em 2026.
   Mudou aqui, muda no simulador da página inicial, no simulador das páginas
   de imóvel, veículo e maquinário, na composição da parcela, no gráfico e no
   simulador de lance (lances.html). Antes existiam duas cópias (index e
   lances), e cada ajuste tinha de ser feito nas duas.
   Carregado SEM defer, antes dos scripts que leem window.AstroTaxas.
   ========================================================================== */
window.AstroTaxas = {
  modalidade: 'imovel',
  prazo: 120,

  perfis: {
    imovel: {
      nome:'Imóvel', bem:'imóvel',
      N:120,           /* prazo de referência, em meses */
      prazos:[60,80,100,120,140,180,240],
      I:0.0095,        /* juros do SBPE ao mês, faixa 10,5% a 12% ao ano + TR */
      ADM:0.20,        /* taxa de administração, faixa 18% a 22% */
      FR:0.02,         /* fundo de reserva, faixa 1% a 3% */
      SEG:0.0005,      /* seguro prestamista ao mês sobre o saldo */
      MIP:0.00035,     /* morte e invalidez, sobre o saldo devedor */
      DFI:0.00010,     /* danos ao imóvel: só existe quando o bem é imóvel */
      IOF:0,           /* crédito imobiliário é isento */
      TXB:25,          /* taxa mensal do banco */
      indice:'INCC',   /* crédito imobiliário é corrigido pelo INCC */
      indiceAnual:0.0656, /* reajuste anual de referência (usado no simulador de lance) */
      ENT:0.20,        /* entrada que um financiamento imobiliário costuma pedir */
      EMBUTIDO:0.30,   /* teto de lance embutido em imóvel, o mais comum entre administradoras */
      min:50000, max:2000000, passo:10000, padrao:300000,
      atalhos:[[50000,'50 mil'],[150000,'150 mil'],[300000,'300 mil'],[500000,'500 mil'],[800000,'800 mil'],[1000000,'1 mi']]
    },
    carro: {
      nome:'Automóvel', bem:'veículo',
      N:60,
      prazos:[60,80,100,120,140],
      I:0.0175,        /* CDC de veículo, ordem de grandeza de 2026 */
      ADM:0.16,        /* veículo costuma ficar abaixo de imóvel */
      FR:0.02,
      SEG:0.0004,
      MIP:0.00030,
      DFI:0,           /* não existe: DFI é do imóvel dado em garantia */
      IOF:0.0338,      /* 0,38% fixo + 0,0082% ao dia, teto de 365 dias */
      TXB:25,
      indice:'IPCA',   /* veículo segue IPCA ou tabela do fabricante */
      indiceAnual:0.0422,
      ENT:0.20,        /* entrada típica de CDC de veículo */
      EMBUTIDO:0.25,   /* teto de lance embutido em veículo, mais conservador que o de imóvel */
      /* teto em 2 milhões, não só carro popular: linha alta (Porsche,
         Ferrari, BMW) também fecha consórcio de automóvel e tem
         demanda real — limitar a 400 mil escondia esse público. */
      min:50000, max:2000000, passo:10000, padrao:90000,
      atalhos:[[50000,'50 mil'],[90000,'90 mil'],[250000,'250 mil'],[600000,'600 mil'],[2000000,'2 mi']]
    },
    /* CONFIRMADO PELO JOÃO (14/09/2026): taxa de administração de maquinário
       agrícola fica entre 0,087% e 0,111% ao mês, e o prazo médio desses
       grupos é de 110 a 135 meses — o que dá um custo total diluído de ADM
       entre 10% e 15% da carta ao longo do contrato. Usando o meio das
       faixas: N 120 meses, ADM 12,5%. Confere: 12,5% / 120 meses = 0,104%
       ao mês, dentro da faixa informada. A comparação bancária fica oculta
       nessa modalidade: juros, seguros, IOF e entrada dependem da linha
       rural/industrial e ainda não foram confirmados para uso comercial. */
    maquinario: {
      nome:'Maquinário', bem:'maquinário',
      comparacao:false,
      N:120,
      prazos:[60,80,100,120,140],
      I:0.0175, ADM:0.125, FR:0.02, SEG:0.0004, MIP:0.00030, DFI:0,
      /* não existe índice exclusivo pra máquina agrícola — administradoras
         usam IPCA, INPC ou tabela do fabricante conforme o regulamento do
         grupo. Seguimos IPCA, igual ao automóvel. */
      IOF:0.0338, TXB:25, indice:'IPCA', indiceAnual:0.0422, ENT:0.20,
      EMBUTIDO:0.25,   /* mesmo teto do veículo: maquinário segue a linha mais conservadora */
      /* teto em 3 milhões: maquinário agrícola (colheitadeira, trator
         grande) passa de 1 milhão com frequência — 1 milhão como teto
         escondia justo o ticket mais comum desse público. */
      min:50000, max:3000000, passo:10000, padrao:200000,
      atalhos:[[100000,'100 mil'],[300000,'300 mil'],[600000,'600 mil'],[1200000,'1,2 mi'],[3000000,'3 mi']]
    }
  },

  /* Renda fixa de referência, conferida na fonte em 08/09/2026:
     Selic 14,00% ao ano (Copom de 05/08/2026), CDI 13,90% ao ano.
     IR de 15% é a alíquota de aplicação mantida acima de 720 dias, e incide
     só sobre o ganho, não sobre o principal. */
  CDI: 0.139,
  IR:  0.15,

  /* Quanto renderia o dinheiro que o banco pediria de entrada, se ele ficasse
     aplicado durante o prazo em vez de virar entrada. */
  rendimento: function(pv){
    var p = this.def();
    var entrada = pv * p.ENT;
    var anos = p.N / 12;
    var bruto = entrada * Math.pow(1 + this.CDI, anos);
    var ganhoBruto = bruto - entrada;
    var liquido = entrada + ganhoBruto * (1 - this.IR);
    return { entrada: entrada, liquido: liquido, ganho: liquido - entrada };
  },

  def: function(){
    var base = this.perfis[this.modalidade];
    var prazo = base.prazos.indexOf(this.prazo) > -1 ? this.prazo : base.N;
    return Object.assign({}, base, { N:prazo });
  },

  /* Mês a mês: seguro, MIP e DFI incidem sobre saldo que muda, e o
     financiamento amortiza em Price. Aproximar erraria onde importa. */
  compor: function(pv){
    var t = this.def(), N = t.N;
    var credito = pv / N, adm = pv * t.ADM / N, fundo = pv * t.FR / N;
    var segTot = 0;
    for (var m = 0; m < N; m++) segTot += (pv - credito * m) * t.SEG;

    var pmt = pv * t.I / (1 - Math.pow(1 + t.I, -N));
    var saldo = pv, jurosTot = 0, mipTot = 0;
    for (var k = 0; k < N; k++){
      var j = saldo * t.I;
      jurosTot += j; mipTot += saldo * t.MIP; saldo -= (pmt - j);
    }
    var dfiTot = pv * t.DFI * N, bancoTot = t.TXB * N, iofTot = pv * t.IOF;

    return {
      con: { credito:credito, adm:adm, fundo:fundo, seg:segTot/N,
             parcela: credito + adm + fundo + segTot/N,
             total: pv + pv*t.ADM + pv*t.FR + segTot },
      fin: { amort: pv/N, juros: jurosTot/N, seg:(mipTot+dfiTot)/N,
             banco:(bancoTot + iofTot)/N,
             parcela: pmt + (mipTot+dfiTot)/N + (bancoTot+iofTot)/N,
             total: pmt*N + mipTot + dfiTot + bancoTot + iofTot }
    };
  }
};
