import { contatoLeitorCriarService } from "../services/contatoLeitorCriarService.js";
import { EmailEnviarService } from "../services/emailEnviarService.js";

const contatoLeitorCriarController = async (request, response) => {
    try {
        const { nome, email, assunto, mensagem } = request.body;

        const ipRemetente = request.headers["x-forwarded-for"] || request.socket.remoteAddress; 

        if (!nome || !email || !assunto || !mensagem) {
            return response.status(400).json({ error: "Todos os campos são obrigatórios." });
        }

        // 1. Salva no banco de dados primeiro
        const contatoLeitorSalvo = await contatoLeitorCriarService({ nome, email, assunto, mensagem, ipRemetente });

        // 2. Dispara e aguarda o envio dos e-mails (Essencial para Vercel Serverless)
        try {
            await Promise.all([
                EmailEnviarService.notificarRedacao({ nome, email, assunto, mensagem, ipRemetente }),
                EmailEnviarService.confirmarRecebimentoLeitor({ nome, email })
            ]);
        } catch (emailError) {
            // Registra o erro de e-mail no log da Vercel, mas não impede a confirmação para o leitor pois já salvou no MongoDB
            console.error("Erro ao disparar e-mails via Nodemailer:", emailError);
        }

        // 3. Retorna a resposta HTTP somente após o salvamento e envio concluídos
        return response.status(201).json({
            success: true,
            message: "Mensagem recebida e registrada com sucesso!",
            dados: contatoLeitorSalvo
        });

    } catch (error) {
        console.error("Erro ao processar contato do leitor:", error);
        return response.status(500).json({ error: "Erro interno ao registrar mensagem." });
    }
};

export { 
    contatoLeitorCriarController 
};

