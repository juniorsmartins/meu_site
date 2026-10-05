document.addEventListener("DOMContentLoaded", () => {
    // Carrega o HTML do rodapé dinamicamente se necessário
    carregarFooter();
});

async function carregarFooter() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    try {
        const response = await fetch("../html/footer.html");
        if (!response.ok) throw new Error("Erro ao carregar footer.html");

        footerContainer.innerHTML = await response.text();
        configurarFormularioNewsletter();

    } catch (error) {
        console.error("Erro ao inicializar o rodapé:", error);
    }
}

function configurarFormularioNewsletter() {
    const form = document.querySelector(".newsletter-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const inputEmail = form.querySelector("input[type='email']");
        const btnSubmit = form.querySelector("button");

        if (!inputEmail || !inputEmail.value) return;

        const email = inputEmail.value.trim();

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Enviando...";

            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const resultado = await response.json();

            if (response.ok) {
                alert(resultado.message);
                inputEmail.value = "";
            } else {
                alert(resultado.message || resultado.error || "Não foi possível realizar a inscrição.");
            }

        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            alert("Erro ao se conectar ao servidor. Tente novamente mais tarde.");
            
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Assinar";
        }
    });
}

