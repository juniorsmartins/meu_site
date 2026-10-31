import { indicadorRepository } from '../../repositories/estatisticas/indicadorRepository.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

export const estatisticasService = async () => {

    try {
        const indicadores = await indicadorRepository.findAll();

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
        let saneamentoAguaData = { anos: [], valores: [] }; 
        let saneamentoEsgotoData = { anos: [], valores: [] };
        let energiaAcessoData = { anos: [], valores: [] }; 
        let energiaPerdasData = { anos: [], valores: [] };
        let internetData = { anos: [], valores: [] }; 
        let bandaLargaData = { anos: [], valores: [] };
        let passageiroAereoData = { anos: [], valores: [] }; 
        let consumoEnergiaRodoviariaData = { anos: [], valores: [] };

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
            } else if (ind.slug === 'consumo_energia_rodoviaria') { 
                consumoEnergiaRodoviariaData = { anos: ind.anos || [], valores: ind.valores || [] };
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
            consumo_energia_rodoviaria: consumoEnergiaRodoviariaData
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro ao buscar dados do MongoDB:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

