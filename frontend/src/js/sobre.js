const testeBackendResponse = document.getElementById("teste-backend-response");

const fetchData = async () => {
    if (!testeBackendResponse) {
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/noticias");

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
