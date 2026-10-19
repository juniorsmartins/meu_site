import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId } from "../../helpers/utils.js";
import { regraAutorizarAdminOuDonoDoPerfil } from "../../helpers/usuarioUtils.js";

const usuarioBuscarService = async (id, usuarioAutenticado) => {
    
    validarFormatoId(id);
    regraAutorizarAdminOuDonoDoPerfil(id, usuarioAutenticado);

    const usuarioBuscado = await usuarioRepository.buscarPorId(id);
    if (!usuarioBuscado) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    return usuarioBuscado;
};

export {
    usuarioBuscarService
};

