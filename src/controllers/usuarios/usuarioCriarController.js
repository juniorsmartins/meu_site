import { usuarioCriarService } from '../../services/usuarios/usuarioCriarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioCriarController = async (request, response, next) => {

    try {
        const usuario = request.body;
        const usuarioCriado = await usuarioCriarService(usuario);

        response.status(201).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.CRIADO,
            usuarioCriado 
        });

    } catch (error) {
        next(error); 
    }
};

export {
    usuarioCriarController
};

