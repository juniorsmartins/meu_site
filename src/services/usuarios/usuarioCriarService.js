import { Usuario } from "../../models/usuarioSchema.js";

console.log("Arquivo usuarioCriarService.js carregado.");

const usuarioCriarService = async (usuario) => {
    
    const novoUsuario = await Usuario.create(usuario);
    return novoUsuario;
};

export {
    usuarioCriarService
};

