import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';
import { verificarNoticiaExistePorId } from '../../helpers/noticiaUtils.js';
import { validarFormatoId } from '../../helpers/utils.js';

const noticiaDeletarPorIdService = async (id) => {

    validarFormatoId(id);
    await verificarNoticiaExistePorId(id);

    await noticiaRepository.deletar(id);

    return id;
}

export { 
    noticiaDeletarPorIdService 
};

