import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaAtualizarPorIdService = async (id, request) => {

    // Atualiza a notícia e retorna a versão mais recente
    const noticia = await Noticia.findByIdAndUpdate(
        id,
        request,
        {
            returnDocument: 'after', // retorna a versão mais recente da notícia
            runValidators: true, // garante que os validadores do esquema sejam executados
            context: 'query' // define o contexto da validação como 'query', necessário para que os validadores funcionem corretamente em operações de atualização
        }
    ).lean();

    return noticia;
}

export { 
    noticiaAtualizarPorIdService
};
