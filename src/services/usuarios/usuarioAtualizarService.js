import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId, criptografar } from "../../helpers/utils.js";
import { usuarioAutenticadoEhAdmin, verificarUsuarioExistePorId, verificarDuplicidadeDeEmail, regraAutorizarAdminOuDonoDoPerfil, usuarioEhODonoPerfil } from "../../helpers/usuarioUtils.js";

const usuarioAtualizarService = async (id, dadosAtualizacao, usuarioAutenticado) => {

    // 1. Cláusulas de Guarda (Validações de entrada, existência e autorização)
    validarFormatoId(id);
    regraAutorizarAdminOuDonoDoPerfil(id, usuarioAutenticado);
    regraApenasAdminPodeAlterarFuncao(usuarioAutenticado, dadosAtualizacao);
    await regraAdminUnicoNaoPodeAlterarPropriaFuncao(id, usuarioAutenticado, dadosAtualizacao);
    await verificarUsuarioExistePorId(id); 

    const { nome, email, senha, funcao } = dadosAtualizacao;

    // 2. Validação de Regra de Negócio Específica (E-mail único)
    if (email !== undefined) {
        await verificarDuplicidadeDeEmail(email, id);
    }

    let senhaCriptografada = senha;
    if (senha !== undefined) {
        senhaCriptografada = await criptografar(senha);
    }

    // 3. Sanitização do Payload (Whitelisting / Mass Assignment Protection)
    const dadosFiltrados = {
        ...(nome !== undefined && { nome }),
        ...(email !== undefined && { email }),
        ...(senha !== undefined && { senha: senhaCriptografada }),
        ...(usuarioAutenticadoEhAdmin(usuarioAutenticado) && funcao !== undefined && { funcao })
    };

    // 4. Persistência
    return await usuarioRepository.atualizar(id, dadosFiltrados);
};

const regraApenasAdminPodeAlterarFuncao = (usuarioAutenticado, dadosAtualizacao) => {
    const ehAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'funcao'); // Verifica se o usuário está tentando alterar a função

    if (solicitouAlteracaoDeFuncao && !ehAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO, 403);
    }
};

const regraAdminUnicoNaoPodeAlterarPropriaFuncao = async (idAlvo, usuarioAutenticado, dadosAtualizacao) => {
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'funcao'); 
    const ehAutenticadoAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);
    const ehDonoDoIdAlvo = usuarioEhODonoPerfil(idAlvo, usuarioAutenticado);
    const ehAdminUnico = await usuarioRepository.contarPorFuncao('admin') <= 1;

    if (solicitouAlteracaoDeFuncao && ehAutenticadoAdmin && ehDonoDoIdAlvo && ehAdminUnico) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ULTIMO_ADMIN, 409);
    }
};

export {
    usuarioAtualizarService
};


