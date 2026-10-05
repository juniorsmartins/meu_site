import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { 
    noticiaCriarService
};

