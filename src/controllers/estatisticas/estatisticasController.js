import { estatisticasService } from '../../services/estatisticas/estatisticasService.js';
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

export { 
    estatisticasController 
};

