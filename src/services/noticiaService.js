import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaConsultarPorIdService = async (id) => {
    // Consulta uma notícia pelo ID no banco de dados. Lean true retorna um objeto JavaScript simples em vez de um documento Mongoose.
    const noticia = await Noticia.findById(id).lean();
    return noticia;
}

// Busca notícias por editoria, com um limite opcional de resultados. Se editoria não for fornecida, retorna todas as notícias.
const noticiaBuscarService = async (editoria, limit = 8) => {

    const filtro = editoria ? { editoria } : {};
    const noticias = await Noticia.find(filtro).sort({ createdAt: -1 }).limit(limit);
    return noticias;
};

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { 
    noticiaConsultarPorIdService, 
    noticiaBuscarService, 
    noticiaCriarService
};

