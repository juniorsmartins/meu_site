import { SITE_CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    // Obtém o ID da notícia na URL
    const urlParams = new URLSearchParams(window.location.search);
    const noticiaId = urlParams.get("id");

    if (!noticiaId) {
        exibirMensagemErro("Notícia não encontrada ou parâmetro inválido.");
        return;
    }

    // Busca a notícia na API
    const API_URL = `/api/noticias/${noticiaId}`;

    try {
        const response = await fetch(API_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Erro ao carregar a notícia (Status: ${response.status})`);
        }

        const noticia = await response.json();

        // Preenche os dados básicos
        document.getElementById("noticia-chapeu").textContent = noticia.chapeu || "";
        document.getElementById("noticia-titulo").textContent = noticia.titulo;
        document.getElementById("noticia-linha-fina").textContent = noticia.linhaFina || "";
        document.getElementById("noticia-autor").textContent = noticia.autor || SITE_CONFIG.fundador;

        // Formata e exibe a data de criação
        if (noticia.createdAt) {
            const data = new Date(noticia.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit", 
                month: "long",
                year: "numeric"
            });
            document.getElementById("noticia-data").textContent = data;
        }

        // Imagem Destacada e Legenda (Melhoria 4)
        const imgElement = document.getElementById("noticia-imagem");
        const containerImg = document.getElementById("container-imagem-principal");
        
        if (noticia.imagemUrl) {
            imgElement.src = noticia.imagemUrl;
            imgElement.alt = noticia.titulo;

            const legendaEl = document.getElementById("noticia-imagem-legenda");
            if (noticia.legendaImagem) {
                legendaEl.textContent = noticia.legendaImagem;
            } else {
                legendaEl.style.display = "none";
            }
        } else if (containerImg) {
            containerImg.style.display = "none"; 
        }

        // Injeção de Parágrafos Formatados no Conteúdo (Melhoria 3)
        const containerConteudo = document.getElementById("noticia-conteudo");
        containerConteudo.innerHTML = ""; // Limpa conteúdo anterior

        if (noticia.conteudo) {
            const paragrafos = noticia.conteudo.split("\n").filter(p => p.trim() !== "");
            paragrafos.forEach(texto => {
                const p = document.createElement("p");
                p.textContent = texto;
                containerConteudo.appendChild(p);
            });
        }

        // Atualiza o título da aba com a marca do config.js (Melhoria 1)
        document.title = `${noticia.titulo} - ${SITE_CONFIG.nome}`;

    } catch (error) {
        console.error("Erro ao carregar a notícia:", error);
        exibirMensagemErro(error.message); // Tratamento de Erro Elegante (Melhoria 5)
    }
});

function exibirMensagemErro(mensagem) {
    const container = document.querySelector(".noticia-container");
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
                <h2 style="margin-top: 1rem; color: var(--blue-900);">Não foi possível exibir a notícia</h2>
                <p style="color: var(--tertiary-text-color); margin-top: 0.5rem;">${mensagem}</p>
                <a href="../html/index.html" style="display: inline-block; margin-top: 1.5rem; color: var(--blue-700); font-weight: 600;">← Voltar para a Página Inicial</a>
            </div>
        `;
    }
}

