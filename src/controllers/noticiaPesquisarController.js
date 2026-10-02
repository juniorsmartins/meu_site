import { noticiaPesquisarService } from '../services/noticiaPesquisarService.js';

const noticiaPesquisarController = async (request, response) => {

    try {
        // Extrai os parâmetros de consulta da requisição
        const { editoria, buscaTitulo, limit } = request.query;

        // Chama o serviço para buscar notícias com base na editoria, no título e no limite
        const noticias = await noticiaPesquisarService(editoria, buscaTitulo, Number(limit));

        response.status(200).send(noticias);

    } catch (error) {
        response.status(500).send({ error: "Erro ao buscar notícias." });
    }
};

export { 
    noticiaPesquisarController
};
