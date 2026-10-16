import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { isValidObjectId } from "mongoose";
import { MENSAGENS_ERRO } from '../../configs/mensagensErro.js';

const usuarioAtualizarService = async (id, usuario, usuarioAutenticado) => {

    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ID_INVALIDO, 400)
    }  
    
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(usuario, 'funcao');
    const solicitanteEhAdmin = usuarioAutenticado?.funcao === 'admin';
    if (solicitouAlteracaoDeFuncao && !solicitanteEhAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_ADMIN_OBRIGATÓRIO, 403);
    }

    const usuarioExistente = await usuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
        throw new AppError("Usuário não encontrado.", 404);
    }

    // Atualiza os dados do usuário existente com os novos dados fornecidos.
    Object.assign(usuarioExistente, usuario);

    await usuarioRepository.atualizar(id, usuarioExistente);
    return usuarioExistente;
};

export {
    usuarioAtualizarService
};

