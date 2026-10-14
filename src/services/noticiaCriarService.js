import { Noticia } from '../models/noticiaSchema.js';

console.log("Arquivo noticiaCriarService.js carregado.");

const noticiaCriarService = async (noticia) => {

    const novaNoticia = await Noticia.create(noticia);
    return novaNoticia;
};

export { 
    noticiaCriarService
};

