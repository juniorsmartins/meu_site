import { escaparRegex } from '../../helpers/utils.js';
import { LIMITE_NOTICIAS_POR_PAGINA } from '../../configs/constantsConfig.js';
import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';

const noticiaPesquisarService = async (queryParams = {}) => {

    const { editoria, titulo, pagina = 1, limite = LIMITE_NOTICIAS_POR_PAGINA } = queryParams;
    const filtro = {};

    if (editoria && typeof editoria === 'string' && editoria.trim() !== "") {
        const termoSeguro = escaparRegex(editoria.trim());
        filtro.editoria = { $regex: termoSeguro, $options: "i" };
    }

    if (titulo && typeof titulo === 'string' && titulo.trim() !== "") {
        const termoSeguro = escaparRegex(titulo.trim());
        filtro.titulo = { $regex: termoSeguro, $options: 'i' };
    }

    // Garante números inteiros válidos
    const paginaAtual = Math.max(1, Number(pagina) || 1); // Garante que a página atual seja pelo menos 1
    const limitePorPagina = Math.max(1, Number(limite) || LIMITE_NOTICIAS_POR_PAGINA); // Garante que o limite por página seja pelo menos 1

    // Calcula quantos documentos ignorar (skip)
    const pular = (paginaAtual - 1) * limitePorPagina; // Calcula quantos documentos pular com base na página atual e no limite por página

    // Executa em paralelo a busca paginada e a contagem total de registros
    const [noticias, totalRegistros] = await noticiaRepository.pesquisarComFiltroPaginado({
        filtro,
        pular,
        limitePorPagina
    });

    // Calcula o total de páginas com base no total de notícias e no limite por página
    const totalPaginas = Math.ceil(totalRegistros / limitePorPagina) || 1;

    return {
        noticias: noticias || [],
        totalRegistros: totalRegistros || 0,
        paginaAtual,
        totalPaginas,
        limitePorPagina
    };
};

export { 
    noticiaPesquisarService
};
