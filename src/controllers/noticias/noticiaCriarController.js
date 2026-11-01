import { noticiaCriarService } from '../../services/noticias/noticiaCriarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const noticiaCriarController = async (request, response, next) => {

    try {
        const dadosNoticia = request.body;
        const noticia = await noticiaCriarService(dadosNoticia);

        response.status(201).json({ 
                sucesso: true,
                mensagem: MENSAGENS_SUCESSO.NOTICIA.CRIADO,
                noticia
            });

    } catch (error) {
        next(error);
    }
};

export { 
    noticiaCriarController
};

