import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaPesquisarService = async (editoria, limit = 8) => {

    const filtro = editoria ? { editoria } : {};
    const noticias = await Noticia.find(filtro).sort({ createdAt: -1 }).limit(limit);
    return noticias;
};

export { 
    noticiaPesquisarService
};

