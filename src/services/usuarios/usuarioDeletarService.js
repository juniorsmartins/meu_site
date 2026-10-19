import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId } from "../../helpers/utils.js";
import { usuarioAutenticadoEhAdmin, usuarioEhODonoPerfil, verificarUsuarioExistePorId, regraAutorizarAdminOuDonoDoPerfil } from "../../helpers/usuarioUtils.js";

const usuarioDeletarService = async (id, usuarioAutenticado) => {

    validarFormatoId(id);
    regraAutorizarAdminOuDonoDoPerfil(id, usuarioAutenticado);

    // Regra de segurança para Admins deletando a si mesmos
    const autenticadoEhAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    const ehOProprioUsuario = usuarioEhODonoPerfil(id, usuarioAutenticado);  

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

