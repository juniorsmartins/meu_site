import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaPesquisarService = async (editoria, buscaTitulo, limit = 8) => {

    const filtro = {};

    if (editoria) {
        filtro.editoria = editoria;
    }

    if (buscaTitulo && buscaTitulo.trim() !== "") {
        // $regex: busca a palavra em qualquer parte do título
        // $options: 'i' faz a busca ignorar maiúsculas/minúsculas
        filtro.titulo = { $regex: buscaTitulo.trim(), $options: 'i' };
    }

    const noticias = await Noticia.find(filtro)
        .sort({ createdAt: -1 })
        .limit(limit);

    return noticias;
};

export { 
    noticiaPesquisarService
};
