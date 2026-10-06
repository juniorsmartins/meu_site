import { SITE_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    preencherInformacoesDinamicas();
    configurarEnvioContato();
});

function preencherInformacoesDinamicas() {
    // 1. Atualiza e-mail e localização com base no config.js
    const emailEl = document.getElementById("contato-info-email");
    const localizacaoEl = document.getElementById("contato-info-localizacao");

    if (emailEl) emailEl.textContent = SITE_CONFIG.emailRedacao || "contato@gazetacentral.com.br";
    if (localizacaoEl) localizacaoEl.textContent = SITE_CONFIG.localizacaoPadrao || "Cuiabá - Mato Grosso, Brasil";

    // 2. Atualiza título da aba no navegador
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

        // Exibe mensagem de sucesso visual na tela (sem alert)
        if (msgFeedback) {
            msgFeedback.className = "contato-msg-feedback sucesso";
            msgFeedback.textContent = "Sua mensagem foi enviada com sucesso! Em breve a redação responderá seu contato.";
            msgFeedback.style.display = "block";
        }

        form.reset();

        // Oculta a mensagem de sucesso após 6 segundos
        setTimeout(() => {
            if (msgFeedback) msgFeedback.style.display = "none";
        }, 6000);
    });
}


