import { getDatePorExtenso, getTimeHM } from "./utils.js";
import { SITE_CONFIG } from "./config.js"; // Importa a variável global

document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header-container");

    if (!headerContainer) return;

    try {
        const response = await fetch("../html/header.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar header.html: ${response.status}`);
        }

        headerContainer.innerHTML = await response.text();

        // Injeção dinâmica a partir da variável SITE_CONFIG
        const tituloEl = document.getElementById("header-apresentacao-nome-titulo");
        const subtituloEl = document.getElementById("header-apresentacao-nome-subtitulo");
        
        if (tituloEl) tituloEl.textContent = SITE_CONFIG.nome;
        if (subtituloEl) subtituloEl.textContent = SITE_CONFIG.slogan;

        // Atualiza a tag <title> do navegador automaticamente
        document.title = `${SITE_CONFIG.nome} - Jornalismo Independente`;

        // Preenche Data, Hora e Localização
        document.getElementById("data-extenso").textContent = getDatePorExtenso();
        document.getElementById("hora-extenso").textContent = getTimeHM();
        document.getElementById("localizacao-extenso").textContent = SITE_CONFIG.localizacaoPadrao;

        destacarPaginaAtiva();

    } catch (error) {
        console.error("Erro ao inicializar o cabeçalho:", error);
    }
});

function destacarPaginaAtiva() {
    const caminhoAtual = window.location.pathname;
    const navLinks = document.querySelectorAll("#header-navbar a.nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && caminhoAtual.includes(href.replace("..", ""))) {
            link.classList.add("active");
        } else if (caminhoAtual === "/" || caminhoAtual.endsWith("index.html")) {
            if (href.includes("index.html")) {
                link.classList.add("active");
            }
        }
    });
}

