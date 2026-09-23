const multiDataResponse = document.getElementById("multi-data-response");

const fetchData = async () => {
    if (!multiDataResponse) {
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/user");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        multiDataResponse.textContent = JSON.stringify(data, null, 2);
        
    } catch (error) {
        multiDataResponse.textContent = "Erro ao buscar dados do backend.";
        console.error("Erro ao buscar dados:", error);
    }
};

fetchData();
