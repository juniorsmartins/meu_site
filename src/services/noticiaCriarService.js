import { Noticia } from '../models/noticiaSchema.js';

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { 
    noticiaCriarService
};

