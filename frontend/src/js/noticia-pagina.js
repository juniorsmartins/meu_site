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

        // Imagem Destacada e Legenda (Corrigido para imagemLegenda)
        const imgElement = document.getElementById("noticia-imagem");
        const containerImg = document.getElementById("container-imagem-principal");
        const legendaEl = document.getElementById("noticia-imagem-legenda");

        if (noticia.imagemUrl) {
            imgElement.src = noticia.imagemUrl;
            imgElement.alt = noticia.titulo;

            // Busca pelo nome exato do campo no Mongoose: imagemLegenda
            const textoLegenda = noticia.imagemLegenda || noticia.legendaImagem;

            if (textoLegenda) {
                legendaEl.textContent = textoLegenda;
                legendaEl.style.display = "block";
            } else {
                legendaEl.style.display = "none";
            }
        } else if (containerImg) {
            containerImg.style.display = "none"; 
        }

        // Renderização do Conteúdo HTML Formatado
        const containerConteudo = document.getElementById("noticia-conteudo");

        if (noticia.conteudo) {
            // Tratamento e limpeza do HTML bruto vindo do RSS
            let htmlTratado = noticia.conteudo;

            // 1. Remove pixels invisíveis de rastreamento do EBC
            htmlTratado = htmlTratado.replace(/<img[^>]*ebc\.(png|gif)[^>]*>/gi, "");

            // 2. Remove o bloco de logo/link inicial da Agência Brasil no topo do conteúdo
            htmlTratado = htmlTratado.replace(/<p[^>]*style="text-align:center;"[^>]*>[\s\S]*?<\/p>/gi, "");

            // 3. Renderiza o HTML interpretando as tags reais (<p>, <strong>, <a>, <h2>, etc.)
            containerConteudo.innerHTML = htmlTratado;
        } else {
            containerConteudo.innerHTML = "";
        }

        // Atualiza o título da aba com a marca do config.js
        document.title = `${noticia.titulo} - ${SITE_CONFIG.nome}`;

    } catch (error) {
        console.error("Erro ao carregar a notícia:", error);
        exibirMensagemErro(error.message);
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

