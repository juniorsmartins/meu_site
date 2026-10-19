import { isValidObjectId } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';

const validarFormatoId = (id) => {
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.GERAL.ID_INVALIDO, 400);
    }
};

export {
    validarFormatoId
};

