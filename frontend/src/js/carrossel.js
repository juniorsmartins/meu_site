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

        await carregarCarrosselCompleto();

    } catch (error) {
        console.error("Erro no fluxo do carrossel", error);
    }
});

async function carregarCarrosselCompleto() {
    const API_URL = "https://meu-site-ashy-omega.vercel.app/api/noticias";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro ao carregar notícias: ${response.status}`);
        }

        const noticias = await response.json();

        if (!noticias || noticias.length === 0) {
            throw new Error("Nenhuma notícia encontrada");
        }

        renderizarCarrossel1(noticias[0]);
        renderizarCarrossel2(noticias.slice(1, 5));
        renderizarCarrossel3(noticias.slice(5, 8));

    } catch (error) {
        console.error("Erro ao carregar carrossel completo", error);
    }
}

function renderizarCarrossel1(noticia) {

    if (!noticia) {
        return;
    }

    const carrossel1 = document.getElementById("carrossel-1-item");
    if (!carrossel1) {
        return;
    }

    const tituloElemento = carrossel1.querySelector(".noticia-titulo");
    if (tituloElemento) {
        tituloElemento.textContent = noticia.titulo;
    }

    const imagem = noticia.imagemUrl || noticia.imagem;
    if (imagem) {
        carrossel1.style.backgroundImage = `url('${imagem}')`;
    }
}

function renderizarCarrossel2(noticias) {

    const carrossel2 = document.getElementById("carrossel-2");
    const template = document.getElementById("template-carrossel-2-itens");

    if (!carrossel2 || !template || !noticias.length) {
        return;
    }

    carrossel2.innerHTML = "";
    const fragment = document.createDocumentFragment();

    noticias.forEach(noticia => {
        const clone = template.content.cloneNode(true);

        const card = clone.querySelector(".carrossel-2-itens");
        const titulo = clone.querySelector(".noticia-titulo");

        titulo.textContent = noticia.titulo;
        const imagem = noticia.imagemUrl || noticia.imagem;
        if (imagem) {
            card.style.backgroundImage = `url('${imagem}')`;
        }

        fragment.appendChild(clone);
    });

    carrossel2.appendChild(fragment);
}

function renderizarCarrossel3(noticias) {

    const carrossel3 = document.getElementById("carrossel-3");
    const template = document.getElementById("template-carrossel-3-itens");

    if (!carrossel3 || !template || !noticias.length) {
        return;
    }

    /* Limpa o conteúdo anterior */
    carrossel3.innerHTML = ""; 

    /* Cria fragmento de documento para otimizar inserção de múltiplos elementos */
    const fragment = document.createDocumentFragment(); 

    noticias.forEach(noticia => {
        /* Clona o template para cada notícia */
        const clone = template.content.cloneNode(true);

        /* Atualiza o conteúdo do card com os dados da notícia */
        const card = clone.querySelector(".carrossel-3-itens");

        /* Atualiza o título da notícia */
        const titulo = clone.querySelector(".noticia-titulo");
        titulo.textContent = noticia.titulo;

        /* Atualiza a imagem de fundo do card */
        const imagem = noticia.imagemUrl || noticia.imagem;
        if (imagem) {
            card.style.backgroundImage = `url('${imagem}')`;
        }

        /* Adiciona o clone ao fragmento */
        fragment.appendChild(clone);
    });

    /* Adiciona o fragmento ao carrossel */
    carrossel3.appendChild(fragment);        
}




