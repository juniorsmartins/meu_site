const testeBackendResponse = document.getElementById("teste-backend-response");

const fetchData = async () => {
    if (!testeBackendResponse) {
        return;
    }

    try {
        
        const localHosts = ["localhost", "127.0.0.1", "::1"];
        const isLocal = localHosts.includes(window.location.hostname);

        const localApiHost = window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
        const apiBase = isLocal ? `http://${localApiHost}:3000` : "/api";
        const response = await fetch(`${apiBase}/noticias`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        testeBackendResponse.textContent = JSON.stringify(data, null, 2);
        
    } catch (error) {
        testeBackendResponse.textContent = "Erro ao buscar dados do backend.";
        console.error("Erro ao buscar dados:", error);
    }
};

fetchData();
