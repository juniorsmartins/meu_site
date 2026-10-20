import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { verificarDuplicidadeDeEmail } from "../../helpers/usuarioUtils.js";

const usuarioCriarService = async (dadosUsuario) => {

    const { nome, email, senha } = dadosUsuario;

    await verificarDuplicidadeDeEmail(email);

    const usuarioCriado = await usuarioRepository.criar({ nome, email, senha });

    const usuarioRetorno = { ...usuarioCriado };
    delete usuarioRetorno.senha; // Remove a senha do objeto de retorno por segurança

    return usuarioRetorno;
};

export {
    usuarioCriarService
};


