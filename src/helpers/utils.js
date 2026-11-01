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

// Função auxiliar para escapar caracteres especiais de regex e evitar ReDoS - Regular Expression Denial of Service - ataques de negação de serviço via expressões regulares maliciosas
const escaparRegex = (texto) => {
    return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

export {
    validarFormatoId,
    criptografar,
    escaparRegex
};

