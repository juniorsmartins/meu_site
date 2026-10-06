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

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const payload = {
            nome: formData.get("nome"),
            email: formData.get("email"),
            assunto: formData.get("assunto"),
            mensagem: formData.get("mensagem")
        };

        const btnSubmit = form.querySelector("button[type='submit']");

        try {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<i class="bi bi-hourglass-split"></i> Enviando...`;

            const response = await fetch("/api/contato", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const resultado = await response.json();

            if (response.ok) {
                msgFeedback.className = "contato-msg-feedback sucesso";
                msgFeedback.textContent = resultado.message || "Sua mensagem foi enviada com sucesso!";
                form.reset();
            } else {
                msgFeedback.className = "contato-msg-feedback erro";
                msgFeedback.textContent = resultado.error || "Não foi possível enviar sua mensagem.";
            }
            msgFeedback.style.display = "block";

        } catch (error) {
            console.error("Erro na requisição:", error);
            msgFeedback.className = "contato-msg-feedback erro";
            msgFeedback.textContent = "Erro de conexão ao enviar a mensagem. Tente novamente mais tarde.";
            msgFeedback.style.display = "block";
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="bi bi-send-fill"></i> Enviar Mensagem`;
        }
    });
}

