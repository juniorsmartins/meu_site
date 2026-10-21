import { usuarioBuscarService } from '../../services/usuarios/usuarioBuscarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioBuscarController = async (request, response, next) => {
    
    try {
        const { id } = request.params;
        const usuarioAutenticado = request.usuario;

        const usuarioBuscado = await usuarioBuscarService(id, usuarioAutenticado);

        return response.status(200).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.BUSCADO,
            usuarioBuscado 
        });

    } catch (error) {
        next(error);
    }
};

export { 
    usuarioBuscarController 
};

