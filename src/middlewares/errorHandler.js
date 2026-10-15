import { AppError } from '../errors/AppError.js';

console.log("Arquivo errorHandler.js carregado.");

function errorHandler(err, req, res, next) {

    // 1. Erros intencionais lançados pela aplicação (regras de negócio)
    if (err instanceof AppError) {
        console.error("Erro esperado: ", err);
        return res.status(err.statusCode).json({ 
            sucesso: false,
            mensagem: err.message 
        });
    }

    // 2. Erro de chave duplicada do MongoDB (E-mail já cadastrado)
    if (err.code === 11000) {
        console.error("Erro de email duplicado:", err);
        return res.status(409).json({
            sucesso: false,
            mensagem: "E-mail já cadastrado no sistema."
        });
    }

    if (err.statusCode === 404) {
        console.error("Erro de usuário não encontrado:", err);
        return res.status(404).json({
            sucesso: false,
            mensagem: err.mensagem
        });
    }

    // 3. Erro de validação de ID do Mongoose (CastError)
    if (err.name === "CastError") {
        console.error("Erro de validação de ID:", err);
        return res.status(400).json({
            sucesso: false,
            mensagem: "ID fornecido está em formato inválido."
        });
    }

    // 4. Erros inesperados de servidor (500)
    console.error("🔥 Erro não tratado:", err);
    return res.status(500).json({
        sucesso: false,
        mensagem: "Ocorreu um erro interno no servidor."
    });
}

export { errorHandler };

