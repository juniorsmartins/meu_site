import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId, usuarioAutenticadoEhAdmin } from "../../helpers/utils.js";
import { verificarUsuarioExistePorId } from "../../helpers/usuarioUtils.js";

const usuarioDeletarService = async (id, usuarioAutenticado) => {

    validarFormatoId(id);

    const autenticadoEhAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);

    // 1. Regras de segurança para não-admins tentando deletar outros usuários
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;    
    if (!autenticadoEhAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_OUTRO_PERFIL, 403);
    }

    // 2. Regra de segurança para Admins deletando a si mesmos
    if (autenticadoEhAdmin && ehOProprioUsuario) {
        const totalAdmins = await usuarioRepository.contarPorFuncao('admin');
        
        if (totalAdmins <= 1) {
            throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO, 403);
        }
    }

    await verificarUsuarioExistePorId(id);

    await usuarioRepository.deletar(id);

    return id;
};

export {
    usuarioDeletarService
};

