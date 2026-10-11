import { noticiaCriarService } from '../services/noticiaCriarService.js';

console.log("Arquivo noticiaCriarController.js carregado.");

const noticiaCriarController = async (request, response) => {

    const noticia = request.body;
    const noticiaCriada = await noticiaCriarService(noticia);

    response.status(201).json(noticiaCriada);
};

export { 
    noticiaCriarController
};


