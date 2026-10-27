import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

export const estatisticasService = async () => {

    try {
        const indicadores = await IndicadorAnualModel.find({});

        let pibData = { anos: [], valores: [] };
        let desempregoData = { anos: [], valores: [] };
        let ipcaData = { anos: [], valores: [] };
        let selicData = { anos: [], valores: [] };
        let dividaLiquidaData = { anos: [], valores: [] };
        let dividaBrutaData = { anos: [], valores: [] };

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
            }
        });

        return {
            pib: pibData,
            desemprego: desempregoData,
            ipca: ipcaData,
            selic: selicData,
            divida_liquida: dividaLiquidaData,
            divida_bruta: dividaBrutaData
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro ao buscar dados do MongoDB:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

