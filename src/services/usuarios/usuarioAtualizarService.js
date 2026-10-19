import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { validarFormatoId, usuarioAutenticadoEhAdmin } from "../../helpers/utils.js";

const usuarioAtualizarService = async (id, dadosAtualizacao, usuarioAutenticado) => {

    validarFormatoId(id);
    const autenticadoEhAdmin = usuarioAutenticadoEhAdmin(usuarioAutenticado);

    // 1. REGRA DE NEGÓCIO: Apenas administradores podem alterar funções de usuários
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'funcao'); // Verifica se o usuário está tentando alterar a função
    if (solicitouAlteracaoDeFuncao && !autenticadoEhAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO, 403);
    }

    // 2. REGRA DE NEGÓCIO: Não-admins só podem atualizar o seu próprio perfil
    // Normalizamos ambos para String para evitar conflito entre ObjectId e String pura
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;
    if (!autenticadoEhAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_OUTRO_PERFIL, 403);
    }

    const usuarioExiste = await usuarioRepository.existePorId(id);
    if (!usuarioExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    // START SEGURANÇA (Whitelisting)
    // SEGURANÇA (Whitelisting): Extraímos apenas os campos permitidos para alteração,
    // blindando contra Mass Assignment de propriedades internas do Mongoose ou do Schema.
    const { nome, email, senha, funcao } = dadosAtualizacao;
    const dadosFiltrados = {};

    if (nome !== undefined) dadosFiltrados.nome = nome;
    
    if (email !== undefined) {
        // 1. REGRA DE NEGÓCIO: O email do usuário deve ser único no sistema
        const emailExiste = await usuarioRepository.buscarPorEmail(email);
        if (emailExiste && (String(emailExiste._id) !== String(id))) {
            throw new AppError(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO, 409);
        }
        dadosFiltrados.email = email;
    }

    if (senha !== undefined) dadosFiltrados.senha = senha; // O hook pre-save do Mongoose cuidará do hash automaticamente!
    if (autenticadoEhAdmin && funcao !== undefined) dadosFiltrados.funcao = funcao;
    // END SEGURANÇA (Whitelisting)

    const usuarioAtualizado = await usuarioRepository.atualizar(id, dadosFiltrados);
    return usuarioAtualizado;
};

export {
    usuarioAtualizarService
};

