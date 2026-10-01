import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaConsultarPorIdService = async (id) => {

    const noticia = await Noticia.findById(id).lean();
    return noticia;
}

export { 
    noticiaConsultarPorIdService
};
