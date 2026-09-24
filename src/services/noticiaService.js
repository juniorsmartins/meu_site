const noticiaBuscarService = async () => {

    const noticia = {
        title: "Notícia 2",
        content: "Conteúdo da notícia"
    }

    return noticia;
};

const noticiaCriarService = async (noticia) => {

    noticia.id = 1;

    return noticia;
};

export { noticiaBuscarService, noticiaCriarService };

