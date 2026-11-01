import { noticiaCriarService } from '../services/noticiaCriarService.js';
import { MENSAGENS_SUCESSO } from '../configs/mensagensConfig.js';

const noticiaCriarController = async (request, response) => {

    const dadosNoticia = request.body;
    const noticia = await noticiaCriarService(dadosNoticia);

    response.status(201).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.NOTICIA.CRIADO,
            noticia
        });
};

export { 
    noticiaCriarController
};

