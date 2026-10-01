import { 
    noticiaBuscarService, 
    noticiaCriarService
} from '../services/noticiaService.js';

const noticiaBuscarController = async (request, response) => {

    try {
        // Extrai os parâmetros de consulta da requisição
        const { editoria, limit } = request.query;
        // Chama o serviço para buscar notícias com base na editoria e limite
        const noticias = await noticiaBuscarService(editoria, Number(limit));

        response.status(200).send(noticias);

    } catch (error) {
        response.status(500).send({ error: "Erro ao buscar notícias" });
    }
};

const noticiaCriarController = async (request, response) => {

    const noticia = request.body;
    const noticiaCriada = await noticiaCriarService(noticia);

    response.status(201).send(noticiaCriada);
};

export { 
    noticiaBuscarController, 
    noticiaCriarController
};

