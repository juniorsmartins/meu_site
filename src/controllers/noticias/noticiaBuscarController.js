import { noticiaBuscarPorIdService } from '../../services/noticias/noticiaBuscarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const noticiaBuscarPorIdController = async (request, response, next) => {

    try {
        const { id } = request.params;

        const noticia = await noticiaBuscarPorIdService(id);

        response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.NOTICIA.BUSCADO,
            noticia
        });

    } catch (error) {
        next(error);
    }
}

export { 
    noticiaBuscarPorIdController
};

