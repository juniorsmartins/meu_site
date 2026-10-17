import { usuarioCriarService } from '../../services/usuarios/usuarioCriarService.js';

const usuarioCriarController = async (request, response, next) => {

    try {
        const usuario = request.body;
        const usuarioCriado = await usuarioCriarService(usuario);

        response.status(201).json(usuarioCriado);

    } catch (error) {
        console.error("Erro no usuarioCriarController:", error.message);
        next(error); // Encaminha o erro para o errorHandler global
    }
};

export {
    usuarioCriarController
};

