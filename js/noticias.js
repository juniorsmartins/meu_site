document.addEventListener("DOMContentLoaded", async () => {
    const noticiasContainer = document.getElementById("noticias-container");

    if (!noticiasContainer) {
        return;
    }

    try {
        const response = await fetch("noticias.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar noticias.html: ${response.status}`);
        }

        noticiasContainer.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
});

