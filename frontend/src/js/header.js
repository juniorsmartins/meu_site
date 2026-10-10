import { getDatePorExtenso, getTimeHM } from "./utils.js";
import { SITE_CONFIG } from "./constantsConfig.js"; // Importa variável global

document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header-container"); // Container principal do header no index.html

    if (!headerContainer) return;

    try {

        const response = await fetch("../html/header.html"); // Carrega o conteúdo do header.html de forma assíncrona
        if (!response.ok) {
            throw new Error(`Erro ao carregar header.html: ${response.status}`);
        }

        headerContainer.innerHTML = await response.text(); // Insere o conteúdo do header.html no container principal

        // Injeção dinâmica a partir da variável SITE_CONFIG
        const titulo = document.getElementById("header-apresentacao-nome-titulo"); // Elemento do título do header
        if (titulo) {
            titulo.textContent = SITE_CONFIG.nome; // Atualiza o título do header
        }

        const subtitulo = document.getElementById("header-apresentacao-nome-subtitulo"); // Elemento do subtítulo do header
        if (subtitulo) {
            subtitulo.textContent = SITE_CONFIG.slogan; // Atualiza o subtítulo do header
        }

        // Atualiza a tag <title> do navegador automaticamente
        document.title = `${SITE_CONFIG.nome} - Jornalismo Independente`;

        document.getElementById("data-extenso").textContent = getDatePorExtenso(); // Atualiza a data por extenso no header


        // Preenche Hora Inicial e Ativa o Relógio Dinâmico
        atualizarHoraDinamica();
        setInterval(atualizarHoraDinamica, 60000); // Atualiza a cada 60 segundos

        // Detecta Cidade/Estado/Clima do Leitor por IP
        await carregarLocalizacaoEClimaDoCliente();

        destacarPaginaAtiva(); // Destaca a página ativa no menu de navegação

    } catch (error) {
        console.error("Erro ao inicializar o cabeçalho:", error);
    }
});

/**
 * Atualiza o elemento de hora com o fuso horário atual do usuário
 */
function atualizarHoraDinamica() {
    
    const horaEl = document.getElementById("hora-extenso");
    if (horaEl) {
        horaEl.textContent = getTimeHM();
    }
}

/**
 * Detecta a localização exata do usuário via IP e busca o clima local
 */
async function carregarLocalizacaoEClimaDoCliente() {

    const localizacao = document.getElementById("localizacao-extenso"); // Elemento que exibirá a localização do usuário
    const clima = document.getElementById("clima-extenso"); // Elemento que exibirá o clima do usuário

    // Fallback padrão configurado no config.js (Cuiabá)
    let localTexto = SITE_CONFIG.localizacaoPadrao;
    let lat = "-15.601";
    let lon = "-56.0978";

    try {
        // API gratuita de geolocalização por IP (sem necessidade de permissão no navegador)
        const localizacaoDoIp = await fetch("https://ipapi.co/json/");
        if (localizacaoDoIp.ok) {
            const dataIp = await localizacaoDoIp.json(); // Dados de localização obtidos a partir do IP do usuário
            if (dataIp.city && dataIp.region) {
                localTexto = `${dataIp.city} - ${dataIp.region}, Brasil`;
                lat = dataIp.latitude;
                lon = dataIp.longitude;
            }
        }

    } catch (e) {
        console.warn("Uso do fallback de localização padrão:", e);
    }

    if (localizacao) {
        localizacao.textContent = localTexto;
    }

    // Busca a temperatura para as coordenadas detectadas
    if (clima) {
        await buscarPrevisaoTempo(lat, lon, clima);
    }
}

/**
 * Consulta a API da Open-Meteo, com latitude e longitude, para obter a previsão do tempo atual do usuário
 */
async function buscarPrevisaoTempo(lat, lon, elementoHtml) {

    try {
        const urlApi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(urlApi); // Faz a requisição à API da Open-Meteo com as coordenadas fornecidas
        if (!res.ok) return;

        const dados = await res.json(); // Converte a resposta da API em JSON
        if (dados && dados.current_weather) {
            const temp = Math.round(dados.current_weather.temperature);
            const codigoClima = dados.current_weather.weathercode;
            const icone = obterIconeClima(codigoClima);

            elementoHtml.innerHTML = `
                <i class="bi ${icone}"></i>
                <span>${temp}°C</span>
            `;
        }

    } catch (err) {
        console.error("Erro ao buscar previsão do tempo:", err);
    }
}

function obterIconeClima(codigo) {
    if (codigo === 0) return "bi-sun-fill";
    if (codigo >= 1 && codigo <= 3) return "bi-cloud-sun-fill";
    if (codigo === 45 || codigo === 48) return "bi-cloud-fog-fill";
    if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return "bi-cloud-rain-heavy-fill";
    if (codigo >= 95) return "bi-cloud-lightning-rain-fill";
    return "bi-thermometer-half";
}

function destacarPaginaAtiva() {
    // Obtém o caminho atual da URL para determinar a página ativa no menu de navegação
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


