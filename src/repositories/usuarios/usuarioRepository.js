import { Usuario } from "../../models/usuarioSchema.js";

const usuarioRepository = {

    async criar(dadosUsuario) {
        const usuario = await Usuario.create(dadosUsuario);
        return usuario.toObject ? usuario.toObject() : usuario;
    },

    async buscarPorEmail(email) {
        return await Usuario.findOne({ email: email.toLowerCase() }).select("-senha");
    },

    async buscarPorId(id) {
        return await Usuario.findById(id).select("-senha");
    },

    async listarTodos() {
        return await Usuario.find().select("-senha").sort({ createdAt: -1 });
    },

    async pesquisarComFiltroPaginado({ filtro, pular, limitePorPagina }) {
        return await Promise.all([
            Usuario.find(filtro)
                .select("-senha")
                .sort({ createdAt: -1 })
                .skip(pular) // Pula os registros já exibidos nas páginas anteriores
                .limit(limitePorPagina)
                .lean(), // Converte os documentos para objetos JavaScript simples
            Usuario.countDocuments(filtro) // Conta o número total de documentos que correspondem ao filtro
        ]);
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
    },

    async contarPorFuncao(funcao) {
        return await Usuario.countDocuments({ funcao });
    },

    async existePorId(id) {
        return await Usuario.exists({ _id: id });
    }
};

export { usuarioRepository };

