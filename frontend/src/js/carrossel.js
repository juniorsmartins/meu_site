import { obterDadosCapa } from './index.js';

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

    try {

        // Consumo do estado unificado da Capa obtido da rota /api/v1/noticias/capa
        // Receber as notícias já filtradas e ordenadas por curadoria editorial e fallback.
        const dadosCapa = await obterDadosCapa();
        if (!dadosCapa) {
            throw new Error("Nenhum dado retornado da Capa");
        }

        // 1. Destaque Principal (1 notícia)
        renderizarCarrossel1(dadosCapa.destaquePrincipal);

        // 2. Destaques Secundários (Primeiro grupo do topo: posições 0 a 3)
        const secundariosBloco1 = (dadosCapa.destaquesSecundarios || []).slice(0, 4);
        renderizarCarrossel2(secundariosBloco1);

        // 3. Destaques Secundários (Segundo grupo: posições 4 a 6)
        const secundariosBloco2 = (dadosCapa.destaquesSecundarios || []).slice(4, 7);
        renderizarCarrossel3(secundariosBloco2);

    } catch (error) {
        console.error("Erro ao carregar carrossel completo", error);
    }
}

function abrirNoticia(id) {
    if (id) {
        window.location.href = `../html/noticia-pagina.html?id=${id}`;
    }
}

function renderizarCarrossel1(noticia) {

    if (!noticia) return;

    const carrossel1 = document.getElementById("carrossel-1-item");
    if (!carrossel1) return;

    const tituloElemento = carrossel1.querySelector(".noticia-titulo");
    if (tituloElemento) {
        tituloElemento.textContent = noticia.titulo;
    }

    const imagem = noticia.imagemUrl || noticia.imagem;
    if (imagem) {
        carrossel1.style.backgroundImage = `url('${imagem}')`;
    }

    // Adiciona o evento de clique para abrir a notícia
    carrossel1.onclick = () => abrirNoticia(noticia._id);
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
        
        // Clona o template para cada notícia
        const clone = template.content.cloneNode(true);

        // Seleciona o card dentro do clone
        const card = clone.querySelector(".carrossel-2-itens");

        // Seleciona o título dentro do clone
        const titulo = clone.querySelector(".noticia-titulo");
        titulo.textContent = noticia.titulo;

        // Seleciona a imagem dentro do clone
        const imagem = noticia.imagemUrl || noticia.imagem;
        if (imagem) {
            card.style.backgroundImage = `url('${imagem}')`;
        }

        // Adiciona o evento de clique para abrir a notícia
        card.onclick = () => abrirNoticia(noticia._id);

        // Adiciona o clone ao fragmento
        fragment.appendChild(clone);
    });

    // Adiciona o fragmento ao carrossel
    carrossel2.appendChild(fragment);
}

function renderizarCarrossel3(noticias) {

    const carrossel3 = document.getElementById("carrossel-3");
    // Seleciona o template do carrossel 3
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

        // Adiciona o evento de clique para abrir a notícia
        card.onclick = () => abrirNoticia(noticia._id);

        /* Adiciona o clone ao fragmento */
        fragment.appendChild(clone);
    });

    /* Adiciona o fragmento ao carrossel */
    carrossel3.appendChild(fragment);        
}

