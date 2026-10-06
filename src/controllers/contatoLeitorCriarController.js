import { contatoLeitorCriarService } from "../services/ContatoLeitorCriarService.js";

const contatoLeitorCriarController = async (request, response) => {

    const { nome, email, assunto, mensagem } = request.body;

    // Captura o IP do remetente (suporta proxies como Vercel, Cloudflare e Express puro)
    const ipRemetente = request.headers["x-forwarded-for"] || request.socket.remoteAddress; 

    if (!nome || !email || !assunto || !mensagem) {
        return response.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const contatoLeitorSalvo = await contatoLeitorCriarService({ nome, email, assunto, mensagem, ipRemetente });

    return response.status(201).json({
            success: true,
            message: "Mensagem recebida e registrada com sucesso!",
            dados: contatoLeitorSalvo
        });
};

export {
    contatoLeitorCriarController
};
