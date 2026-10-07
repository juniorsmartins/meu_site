// Configurações globais fixas do sistema
const IMAGEM_PLACEHOLDER = "https://us.123rf.com/450wm/koblizeek/koblizeek2204/koblizeek220400315/185376169-nenhum-s%C3%ADmbolo-do-vetor-da-imagem-%C3%ADcone-dispon%C3%ADvel-ausente-nenhuma-galeria-para-este-espa%C3%A7o.jpg?ver=6";
const LIMITE_NOTICIAS_POR_COLUNA = 4;

// Ponto de entrada: roda assim que a página carregar
document.addEventListener("DOMContentLoaded", async () => {

    // Obtém o container principal de notícias
    const containerNoticiasPorEditoria = document.getElementById("container-noticias-por-editoria"); 
    // Se não houver área de notícias, para aqui
    if (!containerNoticiasPorEditoria) return; 

    try {
        // 1. Baixa o HTML das colunas
        await garantirEstruturaEditorias(containerNoticiasPorEditoria); 
        // 2. Preenche com os dados do banco
        await carregarNoticiasPorEditoria();

    } catch (error) {
        console.error("Erro ao inicializar o módulo de editorias:", error);
    }
});

// Baixa e injeta o HTML das editorias na tela se ainda não existir
async function garantirEstruturaEditorias(containerNoticiasPorEditoria) {

    // Verifica se a estrutura das editorias já foi carregada anteriormente
    const jaEstaCarregado = document.getElementById("noticias-wraper-2");
    if (jaEstaCarregado) return; // Evita carregar duas vezes

    // Baixa o HTML das editorias
    const resposta = await fetch("../html/noticia-editoria.html"); 
    if (!resposta.ok) {
        throw new Error(`Falha ao carregar HTML: ${resposta.status}`);
    }

    // Injeta o HTML baixado no container principal
    containerNoticiasPorEditoria.innerHTML = await resposta.text();
}

// Percorre todas as colunas de notícias da página
async function carregarNoticiasPorEditoria() {

    // Seleciona todas as colunas de notícias por editoria
    const colunas = document.querySelectorAll(".noticias-por-editoria"); 
    // Obtém o template de notícia por editoria
    const template = document.getElementById("template-noticia-editoria"); 
    if (!template) return;

    // Processa cada coluna de notícias por editoria
    for (const coluna of colunas) { 
        // Processa a coluna atual com o template fornecido
        await processarColunaEditoria(coluna, template); 
    }
}

// Lida com uma coluna específica (ex: Política)
async function processarColunaEditoria(coluna, template) {

    // Obtém o nome da editoria a partir do atributo data-editoria
    const nomeEditoria = coluna.getAttribute("data-editoria"); 
    // Obtém o container onde as notícias serão inseridas
    const containerDaListaDeNoticiasDaEditoria = coluna.querySelector(".noticias-lista"); 

    if (!nomeEditoria || !containerDaListaDeNoticiasDaEditoria) return;

    try {
        // Busca as notícias da editoria atual no backend
        const listaNoticiasPorEditoria = await buscarNoticiasPorEditoria(nomeEditoria); 

        renderizarListaNoticias(containerDaListaDeNoticiasDaEditoria, listaNoticiasPorEditoria, template);

    } catch (error) {
        console.error(`Erro na editoria '${nomeEditoria}':`, error);
    }
}

// Busca as notícias de uma categoria na API
async function buscarNoticiasPorEditoria(nomeEditoria) {

    // Constrói a URL da API para buscar notícias da editoria específica no backend
    const url = `/api/noticias?editoria=${encodeURIComponent(nomeEditoria)}&limite=${LIMITE_NOTICIAS_POR_COLUNA}`; 
    const resposta = await fetch(url);

    if (!resposta.ok) return [];

    const dados = await resposta.json();
    const noticias = Array.isArray(dados) ? dados : (dados.noticias || []);

    return noticias;
}

// Desenha as notícias na tela ou exibe mensagem de lista vazia
function renderizarListaNoticias(containerDaListaDeNoticiasDaEditoria, listaNoticiasPorEditoria, template) {

    containerDaListaDeNoticiasDaEditoria.innerHTML = ""; // Limpa o conteúdo antigo

    if (listaNoticiasPorEditoria.length === 0) {
        containerDaListaDeNoticiasDaEditoria.innerHTML = "<p class='sem-noticias'>Nenhuma notícia encontrada.</p>";
        return;
    }

    listaNoticiasPorEditoria.forEach(noticia => {

        // Cria um card de notícia a partir do template e dos dados da notícia
        const cardNoticia = criarCardNoticia(noticia, template);

        // Adiciona o card na coluna
        containerDaListaDeNoticiasDaEditoria.appendChild(cardNoticia); 
    });
}

// Clona o template do HTML e preenche com os dados da notícia
function criarCardNoticia(noticia, template) {

    // Clona o conteúdo do template
    const clone = template.content.cloneNode(true); 
    // Seleciona o elemento do card de notícia principal dentro do clone
    const cardElement = clone.querySelector(".noticia-por-editoria-1"); 

    const imagemElement = clone.querySelector("img"); 
    const tituloElement = clone.querySelector(".noticia-titulo"); 

    if (imagemElement) {
        imagemElement.src = noticia.imagemUrl || IMAGEM_PLACEHOLDER;
        imagemElement.alt = noticia.titulo;
    }

    if (tituloElement) {
        tituloElement.textContent = noticia.titulo;
    }

    if (cardElement) {
        // Define o comportamento de clique no card
        // Redireciona para a página completa da notícia ao clicar no card
        cardElement.onclick = () => navegarParaNoticia(noticia._id); 
    }

    // Retorna o clone do template preenchido com os dados da notícia
    return clone;
}

// Redireciona o usuário para a página completa da notícia
function navegarParaNoticia(noticiaId) {
    window.location.href = `../html/noticia-pagina.html?id=${noticiaId}`;
}

