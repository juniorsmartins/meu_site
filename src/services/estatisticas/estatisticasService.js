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
        let dividaData = { anos: [], valores: [], meta: { labels: ['Dívida Líquida', 'Dívida Bruta'] } };

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
            } else if (ind.slug === 'divida') {
                dividaData = { 
                    anos: ind.anos || [], 
                    valores: ind.valores || [], 
                    meta: ind.meta || { labels: ['Dívida Líquida', 'Dívida Bruta'] }
                };
            }
        });

        return {
            pib: pibData,
            desemprego: desempregoData,
            ipca: ipcaData,
            selic: selicData,
            divida: dividaData
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro ao buscar dados do MongoDB:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

