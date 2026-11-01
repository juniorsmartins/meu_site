import { usuarioBuscarService } from '../../services/usuarios/usuarioBuscarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioBuscarController = async (request, response, next) => {
    
    try {
        const { id } = request.params;
        const usuarioAutenticado = request.usuario;

        const usuario = await usuarioBuscarService(id, usuarioAutenticado);

        return response.status(200).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.BUSCADO,
            usuario
        });

    } catch (error) {
        next(error);
    }
};

export { 
    usuarioBuscarController 
};

