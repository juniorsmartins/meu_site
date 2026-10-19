import { isValidObjectId } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import { FUNCOES_USUARIO } from '../configs/constantsConfig.js'

const validarFormatoId = (id) => {
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.GERAL.ID_INVALIDO, 400);
    }

};

const usuarioAutenticadoEhAdmin = (usuarioAutenticado) => {
    const usuarioAutenticadoEhAdmin = usuarioAutenticado?.funcao === FUNCOES_USUARIO.ADMIN;
    return usuarioAutenticadoEhAdmin;
};

export {
    validarFormatoId,
    usuarioAutenticadoEhAdmin
};

