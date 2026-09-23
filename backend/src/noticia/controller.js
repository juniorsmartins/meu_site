import { noticiasGetService } from './service.js';

const noticiasGetController = async (request, response) => {

    const noticia = await noticiasGetService();

    response.status(200).send(noticia);
};

export { noticiasGetController };


