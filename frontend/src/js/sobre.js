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

    // 2. Preenche o nome da marca em todas as tags do texto marcadas com a classe .nome-site-dinamico
    const elementosNomeSite = document.querySelectorAll(".nome-site-dinamico");
    elementosNomeSite.forEach(el => {
        el.textContent = SITE_CONFIG.nome;
    });

    // 3. Atualiza a aba do navegador
    document.title = `Sobre - ${SITE_CONFIG.nome}`;
}

