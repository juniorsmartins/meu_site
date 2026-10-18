import { z } from 'zod';
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';
import { FUNCOES_USUARIO } from "../configs/constantsConfig.js";

const usuarioCriarSchema = z.object({
    nome: z.string({ 
        message: MENSAGENS_ERRO.USUARIO.CAMPO_NOME_OBRIGATORIO 
    })
    .min(2, MENSAGENS_ERRO.USUARIO.CAMPO_NOME_MINIMO_CARACTERES)
    .trim(),

    email: z.string({ 
        message: MENSAGENS_ERRO.USUARIO.CAMPO_EMAIL_OBRIGATORIO 
    })
    .min(1, MENSAGENS_ERRO.USUARIO.CAMPO_EMAIL_OBRIGATORIO)
    .email(MENSAGENS_ERRO.USUARIO.CAMPO_EMAIL_FORMATO_INVALIDO)
    .lowercase()
    .trim(),

    senha: z.string({ 
        message: MENSAGENS_ERRO.USUARIO.CAMPO_SENHA_OBRIGATORIO 
    })
    .min(3, MENSAGENS_ERRO.USUARIO.CAMPO_SENHA_MINIMO_CARACTERES),

    funcao: z.enum(FUNCOES_USUARIO)
    .optional()
});

const usuarioAtualizarSchema = z.object({
    nome: z.string()
    .min(2, MENSAGENS_ERRO.USUARIO.CAMPO_NOME_MINIMO_CARACTERES)
    .trim()
    .optional(),

    email: z.string()
    .email(MENSAGENS_ERRO.USUARIO.CAMPO_EMAIL_FORMATO_INVALIDO)
    .lowercase()
    .trim()
    .optional(),

    senha: z.string()
    .min(3, MENSAGENS_ERRO.USUARIO.CAMPO_SENHA_MINIMO_CARACTERES)
    .optional(),

    funcao: z.enum(FUNCOES_USUARIO)
    .optional()
});

export { 
    usuarioCriarSchema, 
    usuarioAtualizarSchema 
};

