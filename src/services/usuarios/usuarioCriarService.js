import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";

const usuarioCriarService = async (usuario) => {

    const { nome, email, senha } = usuario;
    if (!nome || !email || !senha) {
        throw new AppError("Nome, e-mail e senha são obrigatórios.", 400);
    }

    const emailExiste = await usuarioRepository.buscarPorEmail(email);
    if (emailExiste) {
        throw new AppError("E-mail já cadastrado no sistema.", 409);
    }

    const usuarioCriado = await usuarioRepository.criar({ nome, email, senha });

    // Remove a senha do objeto de retorno por segurança
    delete usuarioCriado.senha;
    return usuarioCriado;
};

export {
    usuarioCriarService
};

