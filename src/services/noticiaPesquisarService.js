import { Noticia } from '../database/schema/noticiaSchema.js';

const noticiaPesquisarService = async ({ editoria, buscaTitulo, pagina = 1, limite = 8 } = {}) => {

    const filtro = {};

    if (editoria) {
        filtro.editoria = editoria;
    }

    if (buscaTitulo && buscaTitulo.trim() !== "") {
        // $regex: busca a palavra em qualquer parte do título
        // $options: 'i' faz a busca ignorar maiúsculas/minúsculas
        filtro.titulo = { $regex: buscaTitulo.trim(), $options: 'i' };
    }

    // Garante números inteiros válidos
    const paginaAtual = Math.max(1, Number(pagina) || 1); // Garante que a página atual seja pelo menos 1
    const limitePorPagina = Math.max(1, Number(limite) || 8); // Garante que o limite por página seja pelo menos 1

    // Calcula quantos documentos ignorar (skip)
    const pular = (paginaAtual - 1) * limitePorPagina; // Calcula quantos documentos pular com base na página atual e no limite por página

    // Executa em paralelo a busca paginada e a contagem total de registros
    const [noticias, totalNoticias] = await Promise.all([
        Noticia.find(filtro)
            .sort({ createdAt: -1 })
            .skip(pular)
            .limit(limitePorPagina)
            .lean(),
        Noticia.countDocuments(filtro)
    ]);

    // Calcula o total de páginas com base no total de notícias e no limite por página
    const totalPaginas = Math.ceil(totalNoticias / limitePorPagina) || 1;

    return {
        noticias: noticias || [],
        totalNoticias: totalNoticias || 0,
        paginaAtual,
        totalPaginas,
        limitePorPagina
    };
};

export { 
    noticiaPesquisarService
};
