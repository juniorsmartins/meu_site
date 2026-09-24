import { noticiasGetService, noticiasPostService } from '../services/noticiaService.js';

const noticiasGetController = async (request, response) => {

    const noticia = await noticiasGetService();

    response.status(200).send(noticia);
};

const noticiasPostController = async (request, response) => {

    const noticia = request.body;
    const noticiaCriada = await noticiasPostService(noticia);

    response.status(201).send(noticiaCriada);
};

export { noticiasGetController, noticiasPostController };


