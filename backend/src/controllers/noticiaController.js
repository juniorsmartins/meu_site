import { noticiaBuscarService, noticiaCriarService } from '../services/noticiaService.js';

const noticiaBuscarController = async (request, response) => {

    const noticia = await noticiaBuscarService();

    response.status(200).send(noticia);
};

const noticiaCriarController = async (request, response) => {

    const noticia = request.body;
    const noticiaCriada = await noticiaCriarService(noticia);

    response.status(201).send(noticiaCriada);
};

export { noticiaBuscarController, noticiaCriarController };


