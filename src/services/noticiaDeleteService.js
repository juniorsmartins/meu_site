import { Noticia } from '../models/noticiaSchema.js';

console.log("Arquivo noticiaDeleteService.js carregado.");

const noticiaDeletarPorIdService = async (id) => {

    const noticiaDeletada = await Noticia.findByIdAndDelete(id).lean();
    return noticiaDeletada;
}

export { 
    noticiaDeletarPorIdService 
};

