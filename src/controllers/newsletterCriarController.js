import { newsletterCriarService } from '../services/newsletterCriarService.js';

const newsletterCriarController = async (request, response) => {

    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({ error: "O e-mail é obrigatório." });
        }

        const novoInscrito = await newsletterCriarService(email);

        return response.status(201).json({
            message: "Inscrição realizada com sucesso! Obrigado por acompanhar a Gazeta Central.",
            dados: novoInscrito
        });

    } catch (error) {
        console.error("Erro ao cadastrar newsletter:", error);

        if (error.status === 409) {
            return response.status(409).json({ message: error.message });
        }

        return response.status(500).json({ error: "Erro ao salvar e-mail no servidor." });
    }
};

export { 
    newsletterCriarController 
};

