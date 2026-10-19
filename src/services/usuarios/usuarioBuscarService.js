import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId } from "../../helpers/utils.js";

const usuarioBuscarService = async (id, usuarioAutenticado) => {
    
    validarFormatoId(id);

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

