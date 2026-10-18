import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { isValidObjectId } from "mongoose";
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioBuscarService = async (id, usuarioAutenticado) => {
    
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ID_INVALIDO, 400);
    }

    // 1. Usuário comum pode buscar apenas o próprio perfil. Admins podem buscar qualquer usuário.
    const ehAdmin = usuarioAutenticado.funcao === 'admin';
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;
    if (!ehAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_BUSCAR_OUTRO_PERFIL, 403);
    }

    const usuarioBuscado = await usuarioRepository.buscarPorId(id);
    if (!usuarioBuscado) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    return usuarioBuscado;
};

export {
    usuarioBuscarService
};

