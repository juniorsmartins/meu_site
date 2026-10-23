import { estatisticasService } from '../../services/estatisticas/estatisticasService.js';
import { estatisticasSyncService } from '../../services/estatisticas/estatisticasSyncService.js';
import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';
import { AppError } from '../../errors/AppError.js';

const estatisticasController = async (request, response, next) => {
    try {
        const usuarioAutenticado = request.usuario;
        const dadosEstatisticos = await estatisticasService(usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.ESTATISTICAS.CARREGADAS_COM_SUCESSO,
            dados: dadosEstatisticos
        });

    } catch (error) {
        next(error);
    }
};

// Lista o status de todos os indicadores salvos para a tabela do painel admin
const estatisticasStatusController = async (request, response, next) => {
    try {
        const indicadores = await IndicadorAnualModel.find({}).sort({ updatedAt: -1 });

        return response.status(200).json({
            sucesso: true,
            dados: indicadores
        });
    } catch (error) {
        next(error);
    }
};

// Executa a busca nas APIs externas e salva no banco
const estatisticasSincronizarController = async (request, response, next) => {
    try {
        const usuarioAutenticado = request.usuario;
        const resultado = await estatisticasSyncService(usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            mensagem: resultado.mensagem
        });
    } catch (error) {
        next(new AppError("Erro ao sincronizar estatísticas com fontes externas.", 500));
    }
};

export { 
    estatisticasController,
    estatisticasStatusController,
    estatisticasSincronizarController
};

