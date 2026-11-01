import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';

const noticiaCriarService = async (dadosNoticia) => {

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

    const noticiaCriada = await noticiaRepository.criar({ 
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
    });

    const noticiaRetorno = { ...noticiaCriada };
    return noticiaRetorno;
};

export { 
    noticiaCriarService
};

