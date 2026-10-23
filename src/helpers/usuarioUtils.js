import { FUNCOES_USUARIO } from '../configs/constantsConfig.js'
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import { AppError } from "../errors/AppError.js";
import { usuarioRepository } from "../repositories/usuarios/usuarioRepository.js";

const usuarioAutenticadoEhAdmin = (usuarioAutenticado) => usuarioAutenticado?.funcao === FUNCOES_USUARIO.ADMIN;

const usuarioEhODonoPerfil = (idUsuarioAlvo, usuarioAutenticado) => {
    const idAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    return String(idUsuarioAlvo) === idAutenticado;
};

const verificarUsuarioExistePorId = async (id) => {
    const usuarioExiste = await usuarioRepository.existePorId(id);
    if (!usuarioExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }
};

const verificarDuplicidadeDeEmail = async (email, idUsuarioPraAtualizar = null) => {
    const usuarioComEmail = await usuarioRepository.buscarPorEmail(email);

    if (usuarioComEmail && String(usuarioComEmail._id) !== String(idUsuarioPraAtualizar)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO, 409);
    }
};

const regraAutorizarAdminOuDonoDoPerfil = (idUsuarioAlvo, usuarioAutenticado) => {

    const ehAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    const ehOProprioUsuario = usuarioEhODonoPerfil(idUsuarioAlvo, usuarioAutenticado);
    
    if (!ehAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_OUTRO_PERFIL, 403);
    }
};

const regraAutorizarAdmin = (usuarioAutenticado) => {
    const ehAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    if (!ehAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO, 403);
    }
};

export {
    usuarioAutenticadoEhAdmin,
    verificarUsuarioExistePorId,
    verificarDuplicidadeDeEmail,
    regraAutorizarAdminOuDonoDoPerfil,
    usuarioEhODonoPerfil,
    regraAutorizarAdmin
};

