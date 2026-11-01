import { validarFormatoId } from "../../helpers/utils.js";
import { verificarNoticiaExistePorId } from "../../helpers/noticiaUtils.js";
import { noticiaRepository } from "../../repositories/noticias/noticiaRepository.js";

const noticiaAtualizarPorIdService = async (id, dadosNoticia) => {

    // Validações
    await verificarNoticiaExistePorId(id);

    const { 
        chapeu, 
        titulo, 
        linhaFina, 
        conteudo, 
        autor, 
        imagemUrl, 
        imagemLegenda, 
        linkOriginal, 
        destaquePrincipal, 
        destaqueSecundario, 
        editoria 
    } = dadosNoticia;

    // Sanitização do Payload (Whitelisting / Mass Assignment Protection)
    const dadosSanitizados = {
        ...(chapeu !== undefined && { chapeu }),
        ...(titulo !== undefined && { titulo }),
        ...(linhaFina !== undefined && { linhaFina }),
        ...(conteudo !== undefined && { conteudo }),
        ...(autor !== undefined && { autor }),
        ...(imagemUrl !== undefined && { imagemUrl }),
        ...(imagemLegenda !== undefined && { imagemLegenda }),
        ...(linkOriginal !== undefined && { linkOriginal }),
        ...(destaquePrincipal !== undefined && { destaquePrincipal }),
        ...(destaqueSecundario !== undefined && { destaqueSecundario }),
        ...(editoria !== undefined && { editoria })
    };

    // Persistência
    const noticiaAtualizada = await noticiaRepository.atualizar(id, dadosSanitizados);

    return noticiaAtualizada;
}

export { 
    noticiaAtualizarPorIdService
};
