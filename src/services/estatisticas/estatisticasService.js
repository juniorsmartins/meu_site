import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { regraAutorizarAdmin } from '../../helpers/usuarioUtils.js';

export const estatisticasService = async (usuarioAutenticado) => {

    regraAutorizarAdmin(usuarioAutenticado);

    try {
        const indicadores = await IndicadorAnualModel.find({});

        // Mapeia os documentos do banco para o formato consumido pelo frontend
        let anos = [];
        let pibAnual = [];
        let desempregoAnual = [];
        let ipcaAnual = [];
        let selicAnual = [];

        indicadores.forEach(ind => {
            if (ind.slug === 'pib') {
                anos = ind.anos;
                pibAnual = ind.valores;
            } else if (ind.slug === 'desemprego') {
                desempregoAnual = ind.valores;
            } else if (ind.slug === 'ipca') {
                ipcaAnual = ind.valores;
            } else if (ind.slug === 'selic') {
                selicAnual = ind.valores;
            }
        });

        return {
            anos,
            pib: pibAnual,
            desemprego: desempregoAnual,
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro ao buscar dados do MongoDB:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

