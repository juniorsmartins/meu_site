import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaPesquisarService = async (editoria, limit = 8) => {

    const filtroPorNomeEditoria = editoria ? { editoria } : {};

    const noticias = await Noticia.find(filtroPorNomeEditoria)
        .sort({ createdAt: -1 })
        .limit(limit);

    return noticias;
};

export { 
    noticiaPesquisarService
};
