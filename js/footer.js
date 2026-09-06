document.addEventListener("DOMContentLoaded", async () => {
    const footerContainer = document.getElementById("footer-container");

    if (!footerContainer) {
        return;
    }

    try {
        const response = await fetch("footer.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar footer.html: ${response.status}`);
        }

        footerContainer.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
});


