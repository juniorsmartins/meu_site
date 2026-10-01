import { Noticia } from '../database/schema/noticiaSchema.js';

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
    noticiaBuscarService, 
    noticiaCriarService
};

