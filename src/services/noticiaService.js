import { Noticia } from '../database/schema/Noticia.js';

const noticiaBuscarService = async () => {

    const noticia = await Noticia.find();
    return noticia;
};

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { noticiaBuscarService, noticiaCriarService };

