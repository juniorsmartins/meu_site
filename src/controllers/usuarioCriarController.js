import { usuarioCriarService } from '../services/usuarioCriarService.js';

console.log("Arquivo usuarioCriarController.js carregado.");

const usuarioCriarController = async (request, response) => {

    const usuario = request.body;
    const usuarioCriado = await usuarioCriarService(usuario);

    response.status(201).json(usuarioCriado);
};

export {
    usuarioCriarController
};

