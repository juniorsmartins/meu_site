import { SITE_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    preencherInformacoesDinamicas();
    configurarEnvioContato();
});

function preencherInformacoesDinamicas() {
    // Leitura direta e estrita de SITE_CONFIG
    document.getElementById("contato-info-email").textContent = SITE_CONFIG.emailRedacao;
    document.getElementById("contato-info-localizacao").textContent = SITE_CONFIG.localizacaoPadrao;
    document.getElementById("contato-info-atendimento").textContent = SITE_CONFIG.horarioAtendimento;

    // Título da aba do navegador dinâmico
    document.title = `Contato - ${SITE_CONFIG.nome}`;
}

function configurarEnvioContato() {
    const form = document.getElementById("form-contato");
    const msgFeedback = document.getElementById("contato-mensagem-feedback");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const nome = formData.get("nome");
        const email = formData.get("email");
        const assunto = formData.get("assunto");
        const mensagem = formData.get("mensagem");

        console.log("Formulário de Contato enviado:", { nome, email, assunto, mensagem });

        // Feedback visual na tela
        if (msgFeedback) {
            msgFeedback.className = "contato-msg-feedback sucesso";
            msgFeedback.textContent = "Sua mensagem foi enviada com sucesso! Em breve a redação responderá seu contato.";
            msgFeedback.style.display = "block";
        }

        form.reset();

        setTimeout(() => {
            if (msgFeedback) msgFeedback.style.display = "none";
        }, 6000);
    });
}

