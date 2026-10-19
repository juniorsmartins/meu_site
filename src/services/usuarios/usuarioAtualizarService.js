import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId, usuarioAutenticadoEhAdmin } from "../../helpers/utils.js";
import { verificarUsuarioExistePorId, verificarDuplicidadeDeEmail } from "../../helpers/usuarioUtils.js";

const usuarioAtualizarService = async (id, dadosAtualizacao, usuarioAutenticado) => {

    validarFormatoId(id);

    const autenticadoEhAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);

    regraApenasAdminPodeAlterarFuncao(autenticadoEhAdmin, dadosAtualizacao);

    // 2. REGRA DE NEGÓCIO: Não-admins só podem atualizar o seu próprio perfil
    // Normalizamos ambos para String para evitar conflito entre ObjectId e String pura
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;
    if (!autenticadoEhAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_OUTRO_PERFIL, 403);
    }

    await verificarUsuarioExistePorId(id); 

    // START SEGURANÇA (Whitelisting)
    // SEGURANÇA (Whitelisting): Extraímos apenas os campos permitidos para alteração,
    // blindando contra Mass Assignment de propriedades internas do Mongoose ou do Schema.
    const { nome, email, senha, funcao } = dadosAtualizacao;
    const dadosFiltrados = {};

    if (nome !== undefined) dadosFiltrados.nome = nome;
    
    if (email !== undefined) {
        await verificarDuplicidadeDeEmail(email, id);
        dadosFiltrados.email = email;
    }

    if (senha !== undefined) dadosFiltrados.senha = senha; // O hook pre-save do Mongoose cuidará do hash automaticamente!
    if (autenticadoEhAdmin && funcao !== undefined) dadosFiltrados.funcao = funcao;
    // END SEGURANÇA (Whitelisting)

    const usuarioAtualizado = await usuarioRepository.atualizar(id, dadosFiltrados);
    return usuarioAtualizado;
};

const regraApenasAdminPodeAlterarFuncao = (autenticadoEhAdmin, dadosAtualizacao) => {
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'funcao'); // Verifica se o usuário está tentando alterar a função
    if (solicitouAlteracaoDeFuncao && !autenticadoEhAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO, 403);
    }
};

export {
    usuarioAtualizarService
};

