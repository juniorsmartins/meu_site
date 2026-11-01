import { noticiaDeletarPorIdService } from '../../services/noticias/noticiaDeleteService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const noticiaDeletarPorIdController = async (request, response, next) => {

    try {
        const { id } = request.params;

        const idDeletado = await noticiaDeletarPorIdService(id);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.NOTICIA.DELETADO,
            idDeletado
        });

    } catch (error) {
        next(error);
    }
}

export { 
    noticiaDeletarPorIdController 
};

