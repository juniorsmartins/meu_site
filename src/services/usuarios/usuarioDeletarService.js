import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from '../../errors/AppError.js';
import { isValidObjectId } from "mongoose";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

const usuarioDeletarService = async (id, usuarioAutenticado) => {

    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ID_INVALIDO, 400);
    }

    const ehAdmin = usuarioAutenticado.funcao === 'admin';

    // 1. Regras de segurança para não-admins tentando deletar outros usuários
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;    
    if (!ehAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_OUTRO_PERFIL, 403);
    }

    // 2. Regra de segurança para Admins deletando a si mesmos
    if (ehAdmin && ehOProprioUsuario) {
        const totalAdmins = await usuarioRepository.contarPorFuncao('admin');
        
        if (totalAdmins <= 1) {
            throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO, 403);
        }
    }

    const usuarioExiste = await usuarioRepository.existePorId(id);
    if (!usuarioExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    await usuarioRepository.deletar(id);

    return id;
};

export {
    usuarioDeletarService
};

