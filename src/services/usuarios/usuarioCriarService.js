import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

const usuarioCriarService = async (usuario) => {

    const { nome, email, senha } = usuario;
    if (!nome || !email || !senha) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.CAMPOS_OBRIGATÓRIOS, 400);
    }

    const emailExiste = await usuarioRepository.buscarPorEmail(email);
    if (emailExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO, 409);
    }

    const usuarioCriado = await usuarioRepository.criar({ nome, email, senha });

    const usuarioRetorno = { ...usuarioCriado };
    delete usuarioRetorno.senha; // Remove a senha do objeto de retorno por segurança

    return usuarioRetorno;
};

export {
    usuarioCriarService
};

