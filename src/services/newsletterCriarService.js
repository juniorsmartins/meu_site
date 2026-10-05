import { Newsletter } from '../database/schema/newsletterSchema.js';

const newsletterCriarService = async (email) => {

    const emailFormatado = email.trim().toLowerCase();

    // Verifica se o e-mail já está cadastrado
    const inscritoExistente = await Newsletter.findOne({ email: emailFormatado });

    if (inscritoExistente) {
        const error = new Error("Este e-mail já está cadastrado na nossa newsletter!");
        error.status = 409;
        throw error;
    }

    // Cria o registro no MongoDB
    const novoInscrito = await Newsletter.create({ email: emailFormatado });
    return novoInscrito;
};

export { 
    newsletterCriarService 
};

