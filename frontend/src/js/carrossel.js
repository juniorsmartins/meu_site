document.addEventListener("DOMContentLoaded", async () => {
    const carrosselContainer = document.getElementById("carrossel-container");

    if (!carrosselContainer) {
        return;
    }

    try {
        const response = await fetch("../html/carrossel.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar carrossel.html: ${response.status}`);
        }

        carrosselContainer.innerHTML = await response.text();

        await carregarCarrossel3();

    } catch (error) {
        console.error("Erro no fluxo do carrossel", error);
    }
});

async function carregarCarrossel3() {

    const carrossel3 = document.getElementById("carrossel-3-itens");
    const template = document.getElementById("template-carrossel-3-itens");

    if(!carrossel3 || !template) {
        return;
    }

    const API_URL = "https://meu-site-ashy-omega.vercel.app/api/noticias";
    
    try {
        /* O Frontend busca as notícias no endpoint da API do backend */ 
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro ao carregar notícias: ${response.status}`);
        }

        /* Converte a resposta em JSON */
        const noticias = await response.json();
        /* Pega as últimas 3 notícias */
        const ultimasNoticias = noticias.slice(0, 3);

        /* Limpa o conteúdo anterior */
        carrossel3.innerHTML = ""; 
        /* Cria fragmento de documento para otimizar inserção de múltiplos elementos */
        const fragment = document.createDocumentFragment(); 

        ultimasNoticias.forEach(noticia => {
            /* Clona o template para cada notícia */
            const clone = template.content.cloneNode(true);

            /* Atualiza o conteúdo do card com os dados da notícia */
            const card = clone.querySelector(".carrossel-3-itens");
            /* Atualiza o título da notícia */
            const titulo = clone.querySelector(".noticia-titulo");
            titulo.textContent = noticia.titulo;
            /* Atualiza a imagem de fundo do card */
            const imagem = noticia.imagemUrl || noticia.imagem;
            card.style.backgroundImage = `url('${imagem}')`;

            /* Adiciona o clone ao fragmento */
            fragment.appendChild(clone);
        });

        /* Adiciona o fragmento ao carrossel */
        carrossel3.appendChild(fragment);        

    } 
    catch (error) {
        console.error("Erro ao carregar notícias secundárias", error);
        carrosselDestaque3.innerHTML = "<p>Erro ao carregar notícias secundárias.</p>";
    }
}




