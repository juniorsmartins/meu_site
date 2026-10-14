import { Usuario } from "../../models/usuarioSchema.js";

console.log("Arquivo usuarioAtualizarService.js carregado.");

const usuarioAtualizarService = async (id, usuario, usuarioAutenticado) => {
    
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(usuario, 'funcao');
    const solicitanteEhAdmin = usuarioAutenticado?.funcao === 'admin';

    if (solicitouAlteracaoDeFuncao && !solicitanteEhAdmin) {
        const error = new Error("Apenas usuários com função admin podem alterar a função de outro usuário.");
        error.statusCode = 403;
        throw error;
    }

    const usuarioExistente = await Usuario.findById(id);

    if (!usuarioExistente) {
        return null;
    }

    Object.assign(usuarioExistente, usuario);

    await usuarioExistente.save();

    return usuarioExistente;
};

export {
    usuarioAtualizarService
};
