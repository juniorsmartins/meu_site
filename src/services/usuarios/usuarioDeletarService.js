import { Usuario } from '../../models/usuarioSchema.js';
import { AppError } from '../../errors/AppError.js';
import { isValidObjectId } from "mongoose";
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioDeletarService = async (id, usuarioAutenticado) => {

    // 1. Valida formato do ID
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.ID_INVALIDO, 400);
    }

    // 1. Valida se o usuário alvo existe no banco
    const usuarioExiste = await Usuario.findById(id);
    if (!usuarioExiste) {
        throw new AppError(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO, 404);
    }

    const ehAdmin = usuarioAutenticado.funcao === 'admin';
    const ehOProprioUsuario = String(usuarioAutenticado._id) === String(id);

    // 2. Validação de autorização baseada nas regras de negócio
    if (!ehAdmin && !ehOProprioUsuario) {
        throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_OUTRO_PERFIL, 403);
    }

    // 3. Regra de segurança para Admins deletando a si mesmos
    if (ehAdmin && ehOProprioUsuario) {
        const totalAdmins = await Usuario.countDocuments({ funcao: 'admin' });
        
        if (totalAdmins <= 1) {
            throw new AppError(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO, 403);
        }
    }

    // 4. Deleção física no banco de dados
    await Usuario.findByIdAndDelete(id);

    return {
        mensagem: MENSAGENS_SUCESSO.USUARIO.DELETADO,
        idDeletado: id
    };
};

export {
    usuarioDeletarService
};

