import { noticiaAtualizarPorIdService } from '../services/noticiaAtualizarService.js';

const noticiaAtualizarController = async (request, response) => {

    const { id } = request.params;
    const noticia = request.body;
    const noticiaAtualizada = await noticiaAtualizarPorIdService(id, noticia);

    response.status(200).send(noticiaAtualizada);
};

export { 
    noticiaAtualizarController
};
