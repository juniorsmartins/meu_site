import { Noticia } from '../models/noticiaSchema.js';
import { validarFormatoId } from "../helpers/utils.js";
import { verificarNoticiaExistePorId } from "../helpers/noticiaUtils.js";

const noticiaAtualizarPorIdService = async (id, dadosNoticia) => {

    validarFormatoId(id);
    await verificarNoticiaExistePorId(id);

    // Atualiza a notícia e retorna a versão mais recente
    const noticia = await Noticia.findByIdAndUpdate(
        id,
        dadosNoticia,
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
