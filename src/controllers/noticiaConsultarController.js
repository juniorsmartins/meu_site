import { 
    noticiaConsultarPorIdService
} from '../services/noticiaConsultarService.js';

const noticiaConsultarPorIdController = async (request, response) => {

    try {
        // Extrai o ID da notícia dos parâmetros da requisição
        const { id } = request.params;
        // Consulta a notícia pelo ID usando o serviço correspondente
        const noticia = await noticiaConsultarPorIdService(id);

        if (!noticia) {
            return response.status(404).send({ error: "Notícia não encontrada" });
        }

        // Define cabeçalhos de cache para evitar que a resposta seja armazenada em cache
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        // Envia a notícia como resposta
        response.status(200).send(noticia);

    } catch (error) {
        return response.status(400).send({ error: "ID de notícia inválido" });
    }
}

export { 
    noticiaConsultarPorIdController
};
