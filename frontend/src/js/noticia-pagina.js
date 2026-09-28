document.addEventListener("DOMContentLoaded", async () => {
    
    // Obtém o ID da notícia a partir dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Obtém o ID da notícia a partir dos parâmetros da URL
    const noticiaId = urlParams.get("id");

    if (!noticiaId) {
        // Exibe um alerta informando que a notícia não foi encontrada
        alert("Notícia não encontrada");
        // Redireciona para a página inicial se o ID da notícia não for encontrado
        window.location.href = "../html/index.html";
        return;
    }

    // 2. Busca a notícia na API
//    const API_URL = `https://meu-site-ashy-omega.vercel.app/api/noticias/${noticiaId}`;
    const API_URL = `/api/noticias/${noticiaId}`;

    try {
        // Faz a requisição para a API para obter os dados da notícia
        const response = await fetch(API_URL, { cache: "no-store" });

        // Verifica se a resposta da API foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro ao carregar a notícia: ${response.status}`);
        }

        const noticia = await response.json();

        // Preenche os elementos da página com os dados da notícia
        document.getElementById("noticia-chapeu").textContent = noticia.chapeu;
        document.getElementById("noticia-titulo").textContent = noticia.titulo;
        document.getElementById("noticia-linha-fina").textContent = noticia.linhaFina;
        document.getElementById("noticia-autor").textContent = noticia.autor;

        // Formata e exibe a data de criação da notícia
        if (noticia.createdAt) {
            const data = new Date(noticia.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit", 
                month: "long",
                year: "numeric"
            });
            document.getElementById("noticia-data").textContent = data;
        }

        // Exibe a imagem da notícia, se disponível
        const imgElement = document.getElementById("noticia-imagem");
        if (noticia.imagemUrl) {
            imgElement.src = noticia.imagemUrl;
            imgElement.alt = noticia.titulo;
        } else {
            // Oculta o elemento de imagem se não houver URL da imagem disponível
            imgElement.style.display = "none"; 
        }

        // Exibe o conteúdo da notícia
        document.getElementById("noticia-conteudo").textContent = noticia.conteudo;

        // Atualiza o título da página com o título da notícia
        document.title = `${noticia.titulo} - Gazeta Central`;

    } catch (error) {
    console.error("Erro detalhado ao carregar a notícia:", error);
    document.querySelector(".noticia-container").innerHTML = `
        <h2>Erro ao carregar o conteúdo da notícia</h2>
        <p style="color: red; margin-top: 10px;">Detalhes: ${error.message}</p>
    `;
}
})

