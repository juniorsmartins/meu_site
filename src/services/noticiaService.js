import { Noticia } from '../database/schema/Noticia.js';

const noticiaBuscarService = async () => {

    const noticia = await Noticia.find().sort({ createdAt: -1 }).limit(8);
    return noticia;
};

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { noticiaBuscarService, noticiaCriarService };

