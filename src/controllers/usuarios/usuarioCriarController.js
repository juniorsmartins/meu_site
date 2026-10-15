import { usuarioCriarService } from '../../services/usuarios/usuarioCriarService.js';

console.log("Arquivo usuarioCriarController.js carregado.");

const usuarioCriarController = async (request, response, next) => {

    try {
        const usuario = request.body;
        const usuarioCriado = await usuarioCriarService(usuario);

        response.status(201).json(usuarioCriado);

    } catch (error) {
        next(error); // Encaminha o erro para o errorHandler global
    }
};

export {
    usuarioCriarController
};

