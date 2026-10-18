import { usuarioDeletarService } from '../../services/usuarios/usuarioDeletarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioDeletarController = async (request, response, next) => {

    try {
        const { id } = request.params;
        const usuarioAutenticado = request.usuario; // Usuário autenticado injetado pelo middleware de autenticação

        const idDeletado = await usuarioDeletarService(id, usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.DELETADO,
            idDeletado
        });

    } catch (error) {
        next(error); 
    }
};

export { 
    usuarioDeletarController 
};

