import { noticiaPesquisarService } from '../services/noticiaPesquisarService.js';

const noticiaPesquisarController = async (request, response) => {

    try {
        // Extrai os parâmetros de consulta da requisição
        const { editoria, limit } = request.query;
        // Chama o serviço para buscar notícias com base na editoria e limite
        const noticias = await noticiaPesquisarService(editoria, Number(limit));

        response.status(200).send(noticias);

    } catch (error) {
        response.status(500).send({ error: "Erro ao buscar notícias" });
    }
};

export { 
    noticiaPesquisarController
};
