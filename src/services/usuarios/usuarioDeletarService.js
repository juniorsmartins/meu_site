import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId } from "../../helpers/utils.js";
import { usuarioAutenticadoEhAdmin, usuarioEhODonoPerfil, verificarUsuarioExistePorId, regraAutorizarAdminOuDonoDoPerfil } from "../../helpers/usuarioUtils.js";

const usuarioDeletarService = async (id, usuarioAutenticado) => {

    validarFormatoId(id);
    regraAutorizarAdminOuDonoDoPerfil(id, usuarioAutenticado);
    await regraAdminUnicoNaoPodeDeletarASiMesmo(id, usuarioAutenticado);
    await verificarUsuarioExistePorId(id);

    await usuarioRepository.deletar(id);

    return id;
};

const regraAdminUnicoNaoPodeDeletarASiMesmo = async (idAlvo, usuarioAutenticado) => {
    const ehAutenticadoAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    const ehDonoDoIdAlvo = usuarioEhODonoPerfil(idAlvo, usuarioAutenticado);  
    const ehAdminUnico = await usuarioRepository.contarPorFuncao('admin') <= 1;

    if (ehAutenticadoAdmin && ehDonoDoIdAlvo && ehAdminUnico) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO, 403);
    }
};

export {
    usuarioDeletarService
};


