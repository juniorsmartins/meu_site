import { noticiaDeletarPorIdService } from '../services/noticiaDeleteService.js';
import { isValidObjectId } from 'mongoose';

const noticiaDeletarPorIdController = async (request, response) => {

    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).send({ error: 'ID de notícia inválido.' });
    }

    const noticiaDeletada = await noticiaDeletarPorIdService(id);

    if (!noticiaDeletada) {
        return response.status(404).send({ error: "Notícia não encontrada para exclusão." });
    }

    response.status(200).send({ mensagem: "Notícia excluída com sucesso.", noticia: noticiaDeletada });
}

export { noticiaDeletarPorIdController };

