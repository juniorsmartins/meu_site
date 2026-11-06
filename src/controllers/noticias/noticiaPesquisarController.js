import { noticiaPesquisarService } from '../../services/noticias/noticiaPesquisarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const noticiaPesquisarController = async (request, response, next) => {

    try {
        // Extrai os parâmetros de consulta da requisição
        const queryParams = request.query;

        const resultadoPaginado = await noticiaPesquisarService(queryParams);

        response.status(200).send({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.NOTICIA.PESQUISADO,
            ...resultadoPaginado
        });

    } catch (error) {
        next(error);
    }
};

export { 
    noticiaPesquisarController
};

