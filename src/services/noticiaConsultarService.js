import { Noticia } from '../models/noticiaSchema.js';

console.log("Arquivo noticiaConsultarService.js carregado.");

const noticiaConsultarPorIdService = async (id) => {

    const noticia = await Noticia.findById(id).lean();
    return noticia;
}

export { 
    noticiaConsultarPorIdService
};
