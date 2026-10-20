import { usuarioCriarService } from '../../services/usuarios/usuarioCriarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioCriarController = async (request, response, next) => {

    try {
        const dadosUsuario = request.body;
        const usuario = await usuarioCriarService(dadosUsuario);

        response.status(201).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.CRIADO,
            usuario 
        });

    } catch (error) {
        next(error); 
    }
};

export {
    usuarioCriarController
};

