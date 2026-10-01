import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaAtualizarPorIdService = async (id, request) => {

    // Atualiza a notícia e retorna a versão mais recente
    const noticia = await Noticia.findByIdAndUpdate(id, request, { new: true }).lean(); 
    return noticia;
}

export { 
    noticiaAtualizarPorIdService
};