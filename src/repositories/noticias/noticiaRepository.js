import { Noticia } from '../../models/noticiaSchema.js';

const noticiaRepository = {

    async criar(dadosNoticia) {
        const noticia = await Noticia.create(dadosNoticia);
        return noticia.toObject ? noticia.toObject() : noticia;
    },

    async atualizar(id, dadosAtualizacao) {
        return await Noticia.findByIdAndUpdate(
            id,
            { $set: dadosAtualizacao },
            { new: true, runValidators: true }
        ).lean();
    },

    async buscarPorId(id) {
        return await Noticia.findById(id).lean();
    },

    // ---------------------------------------------------------------------
    // VERIFICAÇÃO DE DUPLICIDADE (usada pela automação de importação)
    // ---------------------------------------------------------------------

    async buscarPorLinkOriginal(linkOriginal) {
        if (!linkOriginal) return null;
        return await Noticia.findOne({ linkOriginal }).lean();
    },

    async buscarPorTitulo(titulo) {
        if (!titulo) return null;
        return await Noticia.findOne({ titulo }).lean();
    },

    /**
     * Busca uma notícia duplicada considerando APENAS as chaves reais informadas.
     * Evita o bug de {} vazio (que casaria com qualquer documento).
     */
    async buscarDuplicata({ linkOriginal, titulo }) {
        const condicoes = [];
        if (linkOriginal) condicoes.push({ linkOriginal });
        if (titulo) condicoes.push({ titulo });

        if (condicoes.length === 0) return null;

        return await Noticia.findOne({ $or: condicoes })
            .select({ _id: 1 })
            .lean();
    },

    async existePorLinkOriginal(linkOriginal) {
        if (!linkOriginal) return false;
        const resultado = await Noticia.exists({ linkOriginal }).lean();
        return !!resultado;
    },

    async existePorId(id) {
        const resultado = await Noticia.exists({ _id: id }).lean();
        return !!resultado;
    },

    // ---------------------------------------------------------------------
    // LISTAGEM / BUSCA
    // ---------------------------------------------------------------------
    async listarTodas() {
        return await Noticia.find()
            .sort({ createdAt: -1 })
            .lean();
    },

    async pesquisarComFiltroPaginado({ filtro, pular, limitePorPagina }) {
        return await Promise.all([
            Noticia.find(filtro)
                .sort({ createdAt: -1 })
                .skip(pular)
                .limit(limitePorPagina)
                .lean(),
            Noticia.countDocuments(filtro)
        ]);
    },

    async buscarUltimas(limite = 10) {
        return await Noticia.find()
            .sort({ createdAt: -1 })
            .limit(limite)
            .lean();
    },

    async buscarPorEditoria(editoria, limite = 10) {
        return await Noticia.find({ editoria })
            .sort({ createdAt: -1 })
            .limit(limite)
            .lean();
    },

    // ---------------------------------------------------------------------
    // DESTAQUES
    // ---------------------------------------------------------------------

    async buscarDestaquesPrincipais(limite = 5) {
        return await Noticia.find({ destaquePrincipal: true })
            .sort({ createdAt: -1 })
            .limit(limite)
            .lean();
    },

    async buscarDestaquesSecundarios(limite = 5) {
        return await Noticia.find({ destaqueSecundario: true })
            .sort({ createdAt: -1 })
            .limit(limite)
            .lean();
    },

    // ---------------------------------------------------------------------
    // EXCLUSÃO E CONTAGEM
    // ---------------------------------------------------------------------

    async deletar(id) {
        return await Noticia.findByIdAndDelete(id).lean();
    },

    async deleteAll() {
        return await Noticia.deleteMany({});
    },

    async contarTodas() {
        return await Noticia.countDocuments();
    },

    async contarPorEditoria(editoria) {
        return await Noticia.countDocuments({ editoria });
    }
};

export { 
    noticiaRepository 
};

