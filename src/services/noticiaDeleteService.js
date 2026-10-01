import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaDeletarPorIdService = async (id) => {

    const noticiaDeletada = await Noticia.findByIdAndDelete(id).lean();
    return noticiaDeletada;
}

export { 
    noticiaDeletarPorIdService 
};

