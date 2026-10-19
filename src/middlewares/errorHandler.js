import { AppError } from '../errors/AppError.js';
import { MENSAGENS_ERRO } from '../configs/mensagensConfig.js';

function errorHandler(err, req, res, next) {

    // 1. Erros intencionais lançados pela aplicação (regras de negócio)
    if (err instanceof AppError) {
        console.error("Erro esperado: ", err);
        return res.status(err.statusCode).json({ 
            sucesso: false,
            mensagem: err.message 
        });
    }

    // 2. Erro de chave duplicada do MongoDB 
    if (err.code === 11000) {
        console.error(MENSAGENS_ERRO.GERAL.VALOR_UNICO_DUPLICADO, err);
        return res.status(409).json({
            sucesso: false,
            mensagem: MENSAGENS_ERRO.GERAL.VALOR_UNICO_DUPLICADO
        });
    }

    if (err.statusCode === 404) {
        console.error(err.mensagem + ": ", err);
        return res.status(404).json({
            sucesso: false,
            mensagem: err.mensagem
        });
    }

    // 3. Erro de validação de ID do Mongoose (CastError)
    if (err.name === "CastError") {
        console.error(MENSAGENS_ERRO.GERAL.ID_INVALIDO, err);
        return res.status(400).json({
            sucesso: false,
            mensagem: MENSAGENS_ERRO.GERAL.ID_INVALIDO
        });
    }

    // 4. Erros inesperados de servidor (500)
    console.error("Erro não tratado:", err);
    return res.status(500).json({
        sucesso: false,
        mensagem: MENSAGENS_ERRO.SERVIDOR.ERRO_INTERNO
    });
}

export { 
    errorHandler 
};

