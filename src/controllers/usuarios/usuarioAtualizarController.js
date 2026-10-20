import { usuarioAtualizarService } from "../../services/usuarios/usuarioAtualizarService.js";
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioAtualizarController = async (request, response, next) => {

    try {
        const { id } = request.params;
        const dadosAtualizacao = request.body;
        const usuarioAutenticado = request.usuario;

        const usuario = await usuarioAtualizarService(id, dadosAtualizacao, usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.ATUALIZADO,
            usuario
        });
        
    } catch (error) {
        next(error);
    }
};

export {
    usuarioAtualizarController
};

