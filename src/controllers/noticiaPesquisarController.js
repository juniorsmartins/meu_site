import { noticiaPesquisarService } from '../services/noticiaPesquisarService.js';

const noticiaPesquisarController = async (request, response) => {

    try {
        // Extrai os parâmetros de consulta da requisição
        const { editoria, buscaTitulo, pagina, limite } = request.query;

        const resultadoPaginado = await noticiaPesquisarService({
            editoria, 
            buscaTitulo, 
            pagina: pagina ? Number(pagina) : 1, 
            limite: limite ? Number(limite) : 8
        });

        response.status(200).send(resultadoPaginado);

    } catch (error) {
        console.error("Erro ao pesquisar notícias:", error);
        response.status(500).send({ error: "Erro ao buscar notícias" });
    }
};

export { 
    noticiaPesquisarController
};
