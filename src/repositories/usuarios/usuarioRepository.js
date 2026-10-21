import { Usuario } from "../../models/usuarioSchema.js";

const usuarioRepository = {

    async criar(dadosUsuario) {
        const usuario = await Usuario.create(dadosUsuario);
        return usuario.toObject ? usuario.toObject() : usuario;
    },

    async atualizar(id, dadosAtualizacao) {
        return await Usuario.findByIdAndUpdate(
                id,
                { $set: dadosAtualizacao },
                { new: true, runValidators: true } // Atualiza o usuário e retorna o novo documento
            )
            .select("-senha")
            .lean();
    },

    async buscarPorEmail(email) {
        return await Usuario.findOne({ email: email.toLowerCase() })
            .select("-senha")
            .lean();
    },

    async buscarPorId(id) {
        return await Usuario.findById(id)
            .select("-senha") // Exclui o campo de senha do resultado
            .lean(); // Converte o documento para um objeto JavaScript simples
    },

    async listarTodos() {
        return await Usuario.find()
            .select("-senha")
            .sort({ createdAt: -1 })
            .lean();
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

    async deletar(id) {
        return await Usuario.findByIdAndDelete(id)
            .lean();
    },

    async contarPorFuncao(funcao) {
        return await Usuario.countDocuments({ funcao });
    },

    async existePorId(id) { 
        const resultado = await Usuario.exists({ _id: id }) // Retorna um objeto se existir ou null se não existir.
            .lean();
        return !!resultado; // Converte o resultado em um booleano
    }
};

export { usuarioRepository };


