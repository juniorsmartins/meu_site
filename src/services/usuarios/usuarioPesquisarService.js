import { usuarioRepository } from '../../repositories/usuarios/usuarioRepository.js';
import { LIMITE_USUARIOS_POR_PAGINA } from '../../configs/constantsConfig.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

/**
 * Serviço responsável por pesquisar, filtrar e paginar os usuários do sistema.
 * Restrito exclusivamente a usuários administradores.
 * @param {Object} queryParams - Parâmetros de busca (nome, email, funcao, pagina, limite)
 * @param {Object} usuarioAutenticado - Dados do usuário autenticado no sistema
 */
const usuarioPesquisarService = async (queryParams = {}, usuarioAutenticado = {}) => {
    
    // REGRA DE SEGURANÇA: Somente administradores podem usar a rota de pesquisa de usuários
    if (usuarioAutenticado?.funcao !== 'admin') {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ADMIN_OBRIGATÓRIO, 403);
    }

    const { nome, email, funcao, pagina = 1, limite = LIMITE_USUARIOS_POR_PAGINA } = queryParams;
    const filtro = {};

    // Filtro parcial por Nome ("i" = Case insensitive)
    if (nome) {
        filtro.nome = { $regex: nome.trim(), $options: "i" };
    }

    // Filtro parcial por E-mail ("i" = Case insensitive)
    if (email) {
        filtro.email = { $regex: email.trim(), $options: "i" }; 
    }

    // Filtro por função específica (permitido apenas para admin, o que já foi validado acima)
    if (funcao) {
        filtro.funcao = funcao;
    }

    const paginaAtual = Math.max(1, Number(pagina) || 1);
    const limitePorPagina = Math.max(1, Number(limite) || LIMITE_USUARIOS_POR_PAGINA);
    const pular = (paginaAtual - 1) * limitePorPagina;

    // Busca no repositório com paginação e ordenação decrescente por criação (mais recentes primeiro)
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

export { 
    usuarioPesquisarService 
};

