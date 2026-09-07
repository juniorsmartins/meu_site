document.addEventListener("DOMContentLoaded", async () => {
    const carrosselContainer = document.getElementById("carrossel-container");

    if (!carrosselContainer) {
        return;
    }

    try {
        const response = await fetch("carrossel.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar carrossel.html: ${response.status}`);
        }

        carrosselContainer.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
});




