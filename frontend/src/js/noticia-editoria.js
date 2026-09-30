document.addEventListener("DOMContentLoaded", async () => {
    const noticiasContainer = document.getElementById("noticias-container");

    if (!noticiasContainer) {
        return;
    }

    try {
        const responseHtml = await fetch("../html/noticia-editoria.html");

        if (!responseHtml.ok) {
            throw new Error(`Erro ao carregar noticia-editoria.html: ${responseHtml.status}`);
        }

        noticiasContainer.innerHTML = await responseHtml.text();

        await carregarNoticiasPorEditoria();

    } catch (error) {
        console.error("Erro ao carregar notícias por editoria: ", error);
    }
});

async function carregarNoticiasPorEditoria() {

    // Seleciona todas as colunas de notícias por editoria 
    const colunas = document.querySelectorAll(".noticias-por-editoria"); 

    // Seleciona o template de notícia por editoria
    const template = document.getElementById("template-noticia-editoria");
    if (!template) return;

    // Itera sobre cada coluna de notícias por editoria
    for (const coluna of colunas) {

        // Obtém o nome da editoria a partir do atributo data-editoria da coluna
        const editoria = coluna.getAttribute("data-editoria");
        // Seleciona o container de lista de notícias dentro da coluna
        const listaContainer = coluna.querySelector(".lista-noticias"); 

        if (!editoria || !listaContainer) continue;

        try {

            // Faz a requisição para obter as notícias da editoria atual
            const res = await fetch(`../api/noticias?editoria=${encodeURIComponent(editoria)}&limit=3`); 
            if (!res.ok) continue;
            // Obtém a lista de notícias da resposta
            const noticias = await res.json(); 

            // Limpa a lista de notícias anterior
            listaContainer.innerHTML = ""; 

            if (noticias.length === 0) {
                // Se não houver notícias, exibe uma mensagem de "Nenhuma notícia encontrada"
                listaContainer.innerHTML = "<p class='sem-noticias'>Nenhuma notícia encontrada.</p>";
                continue;
            }

            noticias.forEach(noticia => {

                // Clona o template e preenche com os dados da notícia
                const clone = template.content.cloneNode(true); // Clona o template para cada notícia
                const item = clone.querySelector(".noticia-por-editoria-1"); // Seleciona o item dentro do clone
                const img = clone.querySelector("img"); // Seleciona a imagem dentro do clone
                const titulo = clone.querySelector(".noticia-titulo"); // Seleciona o título dentro do clone

                if (img) {
                    img.src = noticia.imagemUrl || "../img/placeholder.png";
                    img.alt = noticia.titulo;
                }

                if (titulo) {
                    titulo.textContent = noticia.titulo;
                }

                if (item) {
                    // Adiciona o evento de clique para redirecionar para a página da notícia
                    item.onclick = () => {
                        window.location.href = `../html/noticia-pagina.html?id=${noticia._id}`;
                    }
                }

                // Adiciona o clone preenchido à lista de notícias
                listaContainer.appendChild(clone);
            });

        } catch (err) {
            console.error(`Erro ao carregar editorias: ${editoria}`, err);
        }
    }
}

