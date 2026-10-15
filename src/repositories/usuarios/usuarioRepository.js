import { Usuario } from "../../models/usuarioSchema.js";

console.log("Arquivo usuarioRepository.js carregado.");

const usuarioRepository = {

    async criar(dadosUsuario) {
        const usuario = await Usuario.create(dadosUsuario);
        return usuario.toObject ? usuario.toObject() : usuario;
    },

    async buscarPorEmail(email) {
        return await Usuario.findOne({ email: email.toLowerCase() });
    },

    async buscarPorId(id) {
        return await Usuario.findById(id).select("-senha");
    },

    async listarTodos() {
        return await Usuario.find().select("-senha").sort({ createdAt: -1 });
    },

    async atualizar(id, dadosAtualizacao) {
        return await Usuario.findByIdAndUpdate(
            id,
            { $set: dadosAtualizacao },
            { new: true, runValidators: true } // Atualiza o usuário e retorna o novo documento
        ).select("-senha");
    },

    async deletar(id) {
        return await Usuario.findByIdAndDelete(id);
    }
};

export { usuarioRepository };

