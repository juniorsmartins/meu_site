import { isValidObjectId } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import bcrypt from 'bcryptjs';

const validarFormatoId = (id) => {
    if (!isValidObjectId(id)) {
        throw new AppError(MENSAGENS_ERRO.GERAL.ID_INVALIDO, 400);
    }
};

const criptografar = async (valor) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(valor, salt);
};

export {
    validarFormatoId,
    criptografar
};

