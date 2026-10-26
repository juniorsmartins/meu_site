import { noticiaAtualizarPorIdService } from '../services/noticiaAtualizarService.js';
import { isValidObjectId } from 'mongoose';

const noticiaAtualizarController = async (request, response) => {

    const { id } = request.params;
    const noticia = request.body;

    if (!isValidObjectId(id)) {
        return response.status(400).send({ error: 'ID de notícia inválido.' });
    }

    const noticiaAtualizada = await noticiaAtualizarPorIdService(id, noticia);

    if (!noticiaAtualizada) {
        return response.status(404).send({ error: 'Notícia não encontrada para atualização.' });
    }

    response.status(200).send(noticiaAtualizada);
};

export { 
    noticiaAtualizarController
};
