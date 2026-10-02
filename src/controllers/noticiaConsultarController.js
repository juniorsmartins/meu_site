import { 
    noticiaConsultarPorIdService
} from '../services/noticiaConsultarService.js';
import { isValidObjectId } from 'mongoose';

const noticiaConsultarPorIdController = async (request, response) => {

    // Extrai o ID da notícia dos parâmetros da requisição
    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).send({ error: 'ID de notícia inválido.' });
    }

    // Consulta a notícia pelo ID usando o serviço correspondente
    const noticia = await noticiaConsultarPorIdService(id);

    if (!noticia) {
        return response.status(404).send({ error: "Notícia não encontrada para consulta." });
    }

    // Define cabeçalhos de cache para evitar que a resposta seja armazenada em cache
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    // Envia a notícia como resposta
    response.status(200).send(noticia);
}

export { 
    noticiaConsultarPorIdController
};
