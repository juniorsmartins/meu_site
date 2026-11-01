import { noticiaAtualizarPorIdService } from '../../services/noticias/noticiaAtualizarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const noticiaAtualizarController = async (request, response, next) => {

    try {
        const { id } = request.params;
        const dadosNoticia = request.body;

        const noticia = await noticiaAtualizarPorIdService(id, dadosNoticia);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.NOTICIA.ATUALIZADO,
            noticia: noticia
        });

    } catch (error) {
        next(error);
    }
};

export { 
    noticiaAtualizarController
};

