import { noticiaSchema } from '../database/schema/noticiaSchema.js';

const noticiaConsultarPorIdService = async (id) => {
    // Consulta uma notícia pelo ID no banco de dados. Lean true retorna um objeto JavaScript simples em vez de um documento Mongoose.
    const noticia = await noticiaSchema.findById(id).lean();
    return noticia;
}

const noticiaBuscarService = async () => {

    const noticia = await noticiaSchema.find().sort({ createdAt: -1 }).limit(8);
    return noticia;
};

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await noticiaSchema.create(noticia);
    return novaNoticia;
};

export { noticiaConsultarPorIdService, noticiaBuscarService, noticiaCriarService };

