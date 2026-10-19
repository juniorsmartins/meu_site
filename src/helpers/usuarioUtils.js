import { FUNCOES_USUARIO } from '../configs/constantsConfig.js'
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import { AppError } from "../errors/AppError.js";
import { usuarioRepository } from "../repositories/usuarios/usuarioRepository.js";

const usuarioAutenticadoEhAdmin = (usuarioAutenticado) => usuarioAutenticado?.funcao === FUNCOES_USUARIO.ADMIN;

const usuarioEhODonoPerfil = (idUsuarioAlvo, usuarioAutenticado) =>  String(idUsuarioAlvo) === String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');

const verificarUsuarioExistePorId = async (id) => {
    const usuarioExiste = await usuarioRepository.existePorId(id);
    if (!usuarioExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }
};

const verificarDuplicidadeDeEmail = async (email, idUsuarioPraAtualizar = null) => {
    const emailExiste = await usuarioRepository.buscarPorEmail(email);

    const idUsuarioDoEmail = String(emailExiste?._id); 
    const idUsuarioPraAtualizarStr = String(idUsuarioPraAtualizar); 

    if (emailExiste && (idUsuarioDoEmail !== idUsuarioPraAtualizarStr)) {
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


export {
    usuarioAutenticadoEhAdmin,
    verificarUsuarioExistePorId,
    verificarDuplicidadeDeEmail,
    regraAutorizarAdminOuDonoDoPerfil,
    usuarioEhODonoPerfil
};

