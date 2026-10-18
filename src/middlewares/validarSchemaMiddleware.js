import { AppError } from '../errors/AppError.js';

const validarSchema = (schema) => {

    return (request, response, next) => {

        try {
            // Valida o corpo da requisição contra o schema do Zod
            // .parse() lança um erro automaticamente se o dado for inválido
            schema.parse(request.body);
            next(); // Se passou, vai para o Controller

        } catch (error) {
            // Se o Zod detectar falhas, formatamos as mensagens de erro de forma limpa
            // const mensagensErro = error.errors?.map(err => err.message).join(', ') || "Dados inválidos.";
            // next(new AppError(mensagensErro, 400));
            const mensagensErro = error.issues 
                ? error.issues.map(issue => issue.message).join(', ') 
                : "Dados inválidos.";

            next(new AppError(mensagensErro, 400));
        }
    };
};

export { 
    validarSchema 
};

