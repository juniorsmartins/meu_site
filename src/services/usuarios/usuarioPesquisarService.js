import { usuarioRepository } from '../../repositories/usuarios/usuarioRepository.js';
import { LIMITE_USUARIOS_POR_PAGINA } from '../../configs/constantsConfig.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

const usuarioPesquisarService = async (queryParams = {}, usuarioAutenticado = {}) => {
    
    // Somente administradores podem usar a rota de pesquisa de usuários
    if (usuarioAutenticado?.funcao !== 'admin') {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ADMIN_OBRIGATÓRIO, 403);
    }

    const { nome, email, funcao, pagina = 1, limite = LIMITE_USUARIOS_POR_PAGINA } = queryParams;
    const filtro = {};

    // Filtro parcial por Nome ("i" = Case insensitive)
    if (nome && typeof nome === 'string' && nome.trim() !== '') {
        const termoSeguro = escaparRegex(nome.trim());
        filtro.nome = { $regex: termoSeguro, $options: "i" };
    }

    // Filtro parcial por E-mail ("i" = Case insensitive)
    if (email && typeof email === 'string' && email.trim() !== '') {
        const termoSeguro = escaparRegex(email.trim());
        filtro.email = { $regex: termoSeguro, $options: "i" }; 
    }

    if (funcao && typeof funcao === 'string' && funcao.trim() !== '') {
        filtro.funcao = funcao.trim();
    }

    const paginaAtual = Math.max(1, Number(pagina) || 1);
    const limitePorPagina = Math.max(1, Number(limite) || LIMITE_USUARIOS_POR_PAGINA);
    const pular = (paginaAtual - 1) * limitePorPagina;

    const [usuarios, totalRegistros] = await usuarioRepository.pesquisarComFiltroPaginado({
        filtro,
        pular,
        limitePorPagina
    });

    const totalPaginas = Math.ceil(totalRegistros / limitePorPagina) || 1;

    return {
        usuarios: usuarios || [],
        totalRegistros: totalRegistros || 0,
        paginaAtual,
        totalPaginas,
        limitePorPagina
    };
};

// Função auxiliar para escapar caracteres especiais de regex e evitar ReDoS - Regular Expression Denial of Service - ataques de negação de serviço via expressões regulares maliciosas
const escaparRegex = (texto) => {
    return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

export { 
    usuarioPesquisarService 
};

