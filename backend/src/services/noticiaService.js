const noticiasGetService = async () => {

    const noticia = {
        title: "Notícia 2",
        content: "Conteúdo da notícia"
    }

    return noticia;
};

const noticiasPostService = async (noticia) => {

    noticia.id = 1;

    return noticia;
};

export { noticiasGetService, noticiasPostService };

