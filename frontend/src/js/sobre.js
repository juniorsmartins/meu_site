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

    // 3. Injeção Dinâmica dos Dados do Expediente
    const cargoEl = document.getElementById("expediente-cargo");
    const fundadorEl = document.getElementById("expediente-fundador");
    const emailEl = document.getElementById("expediente-email");
    const localizacaoEl = document.getElementById("expediente-localizacao");

    if (cargoEl) cargoEl.textContent = SITE_CONFIG.cargoFundador || "Fundador & Diretor";
    if (fundadorEl) fundadorEl.textContent = SITE_CONFIG.fundador || "Junior Martins";
    if (emailEl) emailEl.textContent = SITE_CONFIG.emailRedacao || "contato@gazetacentral.com.br";
    if (localizacaoEl) localizacaoEl.textContent = SITE_CONFIG.localizacaoPadrao || "Cuiabá - Mato Grosso, Brasil";

    // 4. Atualiza a aba do navegador
    document.title = `Sobre - ${SITE_CONFIG.nome}`;
}

