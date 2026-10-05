import { getDatePorExtenso, getTimeHM } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header-container");

    if (!headerContainer) return;

    try {
        const response = await fetch("../html/header.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar header.html: ${response.status}`);
        }

        headerContainer.innerHTML = await response.text();

        const dataExtensa = getDatePorExtenso();
        const horaMinutos = getTimeHM();

        document.getElementById("data-extenso").textContent = dataExtensa;
        document.getElementById("hora-extenso").textContent = horaMinutos;
        document.getElementById("localizacao-extenso").textContent = "Cuiabá, Mato Grosso, Brasil";

        // Ativa automaticamente o item do menu referente à página atual
        destacarPaginaAtiva();

    } catch (error) {
        console.error(error);
    }
});

function destacarPaginaAtiva() {
    const caminhoAtual = window.location.pathname;
    const navLinks = document.querySelectorAll("#header-navbar a.nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        
        // Compara se o caminho da URL termina com o href do link
        if (href && caminhoAtual.includes(href.replace("..", ""))) {
            link.classList.add("active");
        } else if (caminhoAtual === "/" || caminhoAtual.endsWith("index.html")) {
            if (href.includes("index.html")) {
                link.classList.add("active");
            }
        }
    });
}

