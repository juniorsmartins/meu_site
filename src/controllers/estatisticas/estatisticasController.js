import { estatisticasService } from '../../services/estatisticas/estatisticasService.js';
import { estatisticasSyncService } from '../../services/estatisticas/estatisticasSyncService.js';
import { indicadorRepository } from '../../repositories/indicadorRepository.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const estatisticasController = async (request, response, next) => {
    try {
        const dadosEstatisticos = await estatisticasService();

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
        const indicadores = await indicadorRepository.findAllSorted();

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

        // Captura a fonte selecionada no frontend
        const { fonte } = request.query; 

        // Repassa a fonte para o serviço
        const resultado = await estatisticasSyncService(usuarioAutenticado, fonte);

        return response.status(200).json({
            sucesso: true,
            mensagem: resultado.mensagem
        });

    } catch (error) {
        next(error);
    }
};

export { 
    estatisticasController,
    estatisticasStatusController,
    estatisticasSincronizarController
};

