import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import { AppError } from "../errors/AppError.js";
import { noticiaRepository } from "../repositories/noticias/noticiaRepository.js";

const verificarNoticiaExistePorId = async (id) => {
    const noticiaExiste = await noticiaRepository.existePorId(id);
    if (!noticiaExiste) {
        throw new AppError(MENSAGENS_ERRO.NOTICIA.NAO_ENCONTRADO, 404);
    }
};

export { 
    verificarNoticiaExistePorId 
};

