import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId } from "../../helpers/utils.js";

const noticiaBuscarPorIdService = async (id) => {

    validarFormatoId(id);

    const noticiaBuscada = await noticiaRepository.buscarPorId(id);
    if (!noticiaBuscada) {
        throw new AppError(MENSAGENS_ERRO.NOTICIA.NAO_ENCONTRADO, 404);
    }

    return noticiaBuscada;
}

export { 
    noticiaBuscarPorIdService
};

