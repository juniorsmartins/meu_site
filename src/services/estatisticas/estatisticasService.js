import { indicadorRepository } from '../../repositories/estatisticas/indicadorRepository.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

export const estatisticasService = async () => {

    try {
        const indicadores = await indicadorRepository.findAll();

        // ==========================================================
        // ECONÔMICO
        // ==========================================================
        let pibData = { anos: [], valores: [] };
        let desempregoData = { anos: [], valores: [] };
        let ipcaData = { anos: [], valores: [] };
        let selicData = { anos: [], valores: [] };
        let dividaLiquidaData = { anos: [], valores: [] };
        let dividaBrutaData = { anos: [], valores: [] };
        let cambioData = { anos: [], valores: [] };
        let reservasData = { anos: [], valores: [] };
        let creditoData = { anos: [], valores: [] };
        let inadimplenciaData = { anos: [], valores: [] };
        let balancaComercialData = { anos: [], valores: [] };
        let vendasVarejoData = { anos: [], valores: [] };

        // ==========================================================
        // DEMOGRÁFICO
        // ==========================================================
        let populacaoTotalData = { anos: [], valores: [] };
        let crescimentoPopulacionalData = { anos: [], valores: [] };
        let idhData = { anos: [], valores: [] };
        let idhiData = { anos: [], valores: [] };
        let mortalidadeMaternaData = { anos: [], valores: [] };
        let expectativaVidaHomensData = { anos: [], valores: [] };
        let expectativaVidaMulheresData = { anos: [], valores: [] };
        let fecundidadeData = { anos: [], valores: [] };
        let urbanizacaoData = { anos: [], valores: [] };
        let mortalidadeInfantilData = { anos: [], valores: [] };
        let envelhecimentoData = { anos: [], valores: [] };

        // ==========================================================
        // INFRAESTRUTURA
        // ==========================================================
        let saneamentoAguaData = { anos: [], valores: [] };
        let saneamentoEsgotoData = { anos: [], valores: [] };
        let energiaAcessoData = { anos: [], valores: [] };
        let energiaPerdasData = { anos: [], valores: [] };
        let internetData = { anos: [], valores: [] };
        let bandaLargaData = { anos: [], valores: [] };
        let passageiroAereoData = { anos: [], valores: [] };
        let freteAereoData = { anos: [], valores: [] };

        // ==========================================================
        // EDUCAÇÃO (16 blocos)
        // 6 com adapter pronto + 10 como placeholders até novos adapters
        // ==========================================================
        let idebData = { anos: [], anos_iniciais: [], anos_finais: [] };
        let idebMedioData = { anos: [], valores: [] };
        let proficienciaSaebData = { anos: [], portugues: [], matematica: [] };
        let insuficienteSaebData = { anos: [], portugues: [], matematica: [] };
        let frequenciaLiquidaData = { anos: [], valores: [] };
        let aprovacaoFundamentalData = { anos: [], valores: [] };
        let conclusaoFundamentalData = { anos: [], valores: [] };
        let conclusaoMedioData = { anos: [], valores: [] };
        let evasaoMedioData = { anos: [], valores: [] };
        let analfabetismoData = { anos: [], valores: [] };
        let anosEstudoData = { anos: [], valores: [] };
        let docentesSuperiorData = { anos: [], valores: [] };
        let investimentoEducacaoData = { anos: [], valores: [] };
        let investimentoAlunoData = { anos: [], valores: [] };
        let pisaData = { anos: [], leitura: [], matematica: [], ciencias: [] };
        let pisaGastoData = { paises: [], gasto: [], desempenho: [], destaque: 'Brasil', anos: [] };
        
        indicadores.forEach(ind => {
            if (ind.slug === 'pib') {
                pibData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'desemprego') {
                desempregoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'ipca') {
                ipcaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'selic') {
                selicData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'divida_liquida') {
                dividaLiquidaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'divida_bruta') {
                dividaBrutaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'cambio') {
                cambioData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'reservas') {
                reservasData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'credito') {
                creditoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'inadimplencia') {
                inadimplenciaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'balanca_comercial') {
                balancaComercialData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'vendas_varejo') {
                vendasVarejoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'populacao_total') {
                populacaoTotalData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'crescimento_populacional') {
                crescimentoPopulacionalData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'idh') { 
                idhData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'idhi') { 
                idhiData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'mortalidade_materna') { 
                mortalidadeMaternaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'expectativa_vida_homens') {
                expectativaVidaHomensData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'expectativa_vida_mulheres') {
                expectativaVidaMulheresData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'fecundidade') {
                fecundidadeData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'urbanizacao') { 
                urbanizacaoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'mortalidade_infantil') { 
                mortalidadeInfantilData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'envelhecimento') { 
                envelhecimentoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'saneamento_agua') { 
                saneamentoAguaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'saneamento_esgoto') { 
                saneamentoEsgotoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'energia_acesso') { 
                energiaAcessoData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'energia_perdas') { 
                energiaPerdasData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [] 
                };
            } else if (ind.slug === 'internet') { 
                internetData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'banda_larga') { 
                bandaLargaData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'passageiros_aereos') { 
                passageiroAereoData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'frete_aereo') { // <-- NOVO
                freteAereoData = { anos: ind.anos || [], valores: ind.valores || [] };
            }

            // ----------------------------------------------------------
            // EDUCAÇÃO
            // ----------------------------------------------------------
            else if (ind.slug === 'ideb') {
                idebData = {
                    anos: ind.anos || [],
                    anos_iniciais: ind.anos_iniciais || [],
                    anos_finais: ind.anos_finais || []
                };
            } else if (ind.slug === 'ideb_medio') {
                idebMedioData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'proficiencia_saeb') {
                proficienciaSaebData = {
                    anos: ind.anos || [],
                    portugues: ind.portugues || [],
                    matematica: ind.matematica || []
                };
            } else if (ind.slug === 'insuficiente_saeb') {
                insuficienteSaebData = {
                    anos: ind.anos || [],
                    portugues: ind.portugues || [],
                    matematica: ind.matematica || []
                };
            } else if (ind.slug === 'frequencia_liquida') {
                frequenciaLiquidaData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'aprovacao_fundamental') {
                aprovacaoFundamentalData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'conclusao_fundamental') {
                conclusaoFundamentalData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'conclusao_medio') {
                conclusaoMedioData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'evasao_medio') {
                evasaoMedioData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'analfabetismo') {
                analfabetismoData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'anos_estudo') {
                anosEstudoData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'docentes_superior') {
                docentesSuperiorData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'investimento_educacao') {
                investimentoEducacaoData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'investimento_aluno') {
                investimentoAlunoData = { anos: ind.anos || [], valores: ind.valores || [] };
            } else if (ind.slug === 'pisa') {
                pisaData = {
                    anos: ind.anos || [],
                    leitura: ind.leitura || [],
                    matematica: ind.matematica || [],
                    ciencias: ind.ciencias || []
                };
            } else if (ind.slug === 'pisa_gasto_desempenho') {
                pisaGastoData = {
                    paises: ind.paises || [],
                    gasto: ind.gasto || [],
                    desempenho: ind.desempenho || [],
                    destaque: ind.destaque || 'Brasil',
                    anos: ind.anos || []
                };
            }
        });

        // Junta os dados para o Frontend no formato que o Chart.js espera
        const expectativaVidaUnificada = {
            anos: expectativaVidaHomensData.anos, // Usa os anos dos homens como base (são iguais)
            homens: expectativaVidaHomensData.valores,
            mulheres: expectativaVidaMulheresData.valores
        };

        // Junta os dados de Saneamento
        const saneamentoUnificado = {
            anos: saneamentoAguaData.anos,
            agua: saneamentoAguaData.valores,
            esgoto: saneamentoEsgotoData.valores
        };

        return {
            pib: pibData,
            desemprego: desempregoData,
            ipca: ipcaData,
            selic: selicData,
            divida_liquida: dividaLiquidaData,
            divida_bruta: dividaBrutaData,
            cambio: cambioData,
            reservas: reservasData,
            credito: creditoData, 
            inadimplencia: inadimplenciaData,
            balanca_comercial: balancaComercialData,
            vendas_varejo: vendasVarejoData,
            populacao_total: populacaoTotalData,
            crescimento_populacional: crescimentoPopulacionalData,
            idh: idhData,
            idhi: idhiData,
            mortalidade_materna: mortalidadeMaternaData,
            expectativa_vida: expectativaVidaUnificada,
            fecundidade: fecundidadeData,
            urbanizacao: urbanizacaoData, 
            mortalidade_infantil: mortalidadeInfantilData,
            envelhecimento: envelhecimentoData,
            saneamento: saneamentoUnificado,
            energia_acesso: energiaAcessoData, 
            energia_perdas: energiaPerdasData,
            internet: internetData, 
            banda_larga: bandaLargaData,
            passageiros_aereos: passageiroAereoData,
            frete_aereo: freteAereoData,

            // Educação (16 blocos)
            ideb: idebData,
            ideb_medio: idebMedioData,
            proficiencia_saeb: proficienciaSaebData,
            insuficiente_saeb: insuficienteSaebData,
            frequencia_liquida: frequenciaLiquidaData,
            aprovacao_fundamental: aprovacaoFundamentalData,
            conclusao_fundamental: conclusaoFundamentalData,
            conclusao_medio: conclusaoMedioData,
            evasao_medio: evasaoMedioData,
            analfabetismo: analfabetismoData,
            anos_estudo: anosEstudoData,
            docentes_superior: docentesSuperiorData,
            investimento_educacao: investimentoEducacaoData,
            investimento_aluno: investimentoAlunoData,
            pisa: pisaData,
            pisa_gasto_desempenho: pisaGastoData
            
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro ao buscar dados do MongoDB:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

