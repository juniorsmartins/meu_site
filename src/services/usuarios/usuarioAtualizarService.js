import { usuarioRepository } from "../../repositories/usuarios/usuarioRepository.js";
import { AppError } from "../../errors/AppError.js";
import { isValidObjectId } from "mongoose";
import { MENSAGENS_ERRO } from '../../configs/mensagensErro.js';

const usuarioAtualizarService = async (id, usuario, usuarioAutenticado) => {

    // 1. Valida se o ID fornecido possui um formato ObjectId válido do MongoDB
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ID_INVALIDO, 400);
    }
    
    // 2. REGRA DE SEGURANÇA: Apenas administradores podem alterar funções de usuários
    const solicitanteEhAdmin = usuarioAutenticado?.funcao === 'admin';
    const solicitouAlteracaoDeFuncao = Object.prototype.hasOwnProperty.call(usuario, 'funcao'); // Verifica se o usuário está tentando alterar a função
    if (solicitouAlteracaoDeFuncao && !solicitanteEhAdmin) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_ADMIN_OBRIGATÓRIO, 403);
    }

    // 3. REGRA DE SEGURANÇA: Não-admins só podem atualizar o seu próprio perfil
    // Normalizamos ambos para String para evitar conflito entre ObjectId e String pura
    const idUsuarioAutenticado = String(usuarioAutenticado?.id || usuarioAutenticado?._id || '');
    const idAlvo = String(id);
    const ehOProprioUsuario = idUsuarioAutenticado === idAlvo;
    if (!solicitanteEhAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_PROPRIO_PERFIL_OBRIGATORIO, 403);
    }

    // 4. Busca o usuário no banco de dados
    const usuarioExistente = await usuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    // 5. Atualiza os dados do usuário existente com os novos dados fornecidos
    Object.assign(usuarioExistente, usuario);

    await usuarioRepository.atualizar(id, usuarioExistente);
    return usuarioExistente;
};

export {
    usuarioAtualizarService
};


