import { SITE_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    carregarFooter();
});

async function carregarFooter() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    try {
        const response = await fetch("../html/footer.html");
        if (!response.ok) throw new Error("Erro ao carregar footer.html");

        // 1. Injeta o HTML no contêiner
        footerContainer.innerHTML = await response.text();

        // 2. Atualiza o copyright dinamicamente com o nome vindo do config.js
        atualizarCopyright();

        // 3. Ativa o ouvinte de eventos do formulário de Newsletter
        configurarFormularioNewsletter();

    } catch (error) {
        console.error("Erro ao inicializar o rodapé:", error);
    }
}

function atualizarCopyright() {
    const copyrightEl = document.querySelector(".copyright-info p");
    if (copyrightEl) {
        copyrightEl.innerHTML = `&copy; ${new Date().getFullYear()} ${SITE_CONFIG.nome}. Todos os direitos reservados.`;
    }
}

function configurarFormularioNewsletter() {
    const form = document.querySelector(".newsletter-form");
    const msgContainer = document.getElementById("newsletter-mensagem");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const inputEmail = form.querySelector("input[type='email']");
        const btnSubmit = form.querySelector("button");

        if (!inputEmail || !inputEmail.value) return;

        const email = inputEmail.value.trim();

        // Oculta mensagens anteriores
        if (msgContainer) {
            msgContainer.className = "newsletter-msg";
            msgContainer.style.display = "none";
        }

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Enviando...";

            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const resultado = await response.json();

            if (msgContainer) {
                if (response.ok) {
                    msgContainer.textContent = resultado.message || "Inscrição realizada com sucesso!";
                    msgContainer.classList.add("sucesso");
                    inputEmail.value = "";
                } else {
                    msgContainer.textContent = resultado.message || resultado.error || "Não foi possível realizar a inscrição.";
                    msgContainer.classList.add("erro");
                }
                msgContainer.style.display = "block";
            }

        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            if (msgContainer) {
                msgContainer.textContent = "Erro ao se conectar ao servidor. Tente novamente mais tarde.";
                msgContainer.classList.add("erro");
                msgContainer.style.display = "block";
            }
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Assinar";
        }
    });
}

