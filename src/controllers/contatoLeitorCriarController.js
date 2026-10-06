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

        // 2. Dispara os e-mails em segundo plano sem bloquear o retorno HTTP para o leitor
        Promise.all([
            EmailEnviarService.notificarRedacao({ nome, email, assunto, mensagem, ipRemetente }),
            EmailEnviarService.confirmarRecebimentoLeitor({ nome, email })
        ]).catch(err => {
            console.error("Erro no envio do e-mail em segundo plano:", err);
        });

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

export { contatoLeitorCriarController };

