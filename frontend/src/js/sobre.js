import { SITE_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    preencherInformacoesDinamicas();
});

function preencherInformacoesDinamicas() {
    // 1. Título e Slogan Principal
    const tituloEl = document.getElementById("sobre-titulo-principal");
    const sloganEl = document.getElementById("sobre-slogan-destaque");

    if (tituloEl) tituloEl.textContent = `Sobre a ${SITE_CONFIG.nome}`;
    if (sloganEl) sloganEl.textContent = SITE_CONFIG.slogan;

    // 2. Preenche o nome da marca em todas as ocorrências de .nome-site-dinamico
    const elementosNomeSite = document.querySelectorAll(".nome-site-dinamico");
    elementosNomeSite.forEach(el => {
        el.textContent = SITE_CONFIG.nome;
    });

    // 3. Injeção Dinâmica Estrita dos Dados do Expediente
    document.getElementById("expediente-cargo").textContent = SITE_CONFIG.cargoFundador;
    document.getElementById("expediente-fundador").textContent = SITE_CONFIG.fundador;
    document.getElementById("expediente-email").textContent = SITE_CONFIG.emailRedacao;
    document.getElementById("expediente-localizacao").textContent = SITE_CONFIG.localizacaoPadrao;

    // 4. Atualiza a aba do navegador
    document.title = `Sobre - ${SITE_CONFIG.nome}`;
}

