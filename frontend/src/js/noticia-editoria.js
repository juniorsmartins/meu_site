// Aguarda o documento HTML ser carregado e analisado pelo navegador antes de executar o script assíncrono
document.addEventListener("DOMContentLoaded", async () => {

    // Busca na página o elemento HTML que serve de contêiner onde o módulo de editorias será injetado
    const noticiasContainer = document.getElementById("noticias-container"); 
    // Interrompe imediatamente a execução da função caso o contêiner de notícias não exista na página atual
    if (!noticiasContainer) return;

    try {
        // Verifica se o elemento principal da estrutura de editorias ainda não foi adicionado ao DOM da página
        if (!document.getElementById("noticias-wraper-2")) {

            // Faz uma requisição HTTP para buscar o arquivo HTML estático que contém o layout das editorias e o template
            const responseHtml = await fetch("../html/noticia-editoria.html"); 

            // Checa se a requisição do arquivo HTML falhou (status diferente do intervalo 200-299)
            if (!responseHtml.ok) {
                throw new Error(`Erro ao carregar noticia-editoria.html: ${responseHtml.status}`);
            }

            // Lê o conteúdo da resposta HTTP como texto e injeta a estrutura de HTML diretamente dentro do contêiner da página
            noticiasContainer.innerHTML = await responseHtml.text();
        }   

        // Invoca a função assíncrona responsável por consultar a API e renderizar as notícias de cada categoria
        await carregarNoticiasPorEditoria();

    } catch (error) {
        console.error("Erro ao carregar notícias por editoria: ", error);
    }
});

// Declara a função assíncrona que executa a busca de dados no banco e constrói as listas de notícias
async function carregarNoticiasPorEditoria() {

    // Seleciona no DOM todos os elementos das colunas de editorias 
    const colunas = document.querySelectorAll(".noticias-por-editoria"); 

    // Captura o elemento <template> que guarda a estrutura HTML reutilizável de cada card de notícia
    const template = document.getElementById("template-noticia-editoria");
    if (!template) return;

    // Inicia um laço de repetição para processar sequencialmente cada coluna de editoria encontrada
    for (const coluna of colunas) {

        // Extrai o nome da editoria (ex: "política", "economia") definido no atributo customizado 'data-editoria' da coluna
        const editoria = coluna.getAttribute("data-editoria");

        // Busca a div interna com a classe '.noticias-lista' que irá armazenar os cards de notícias daquela coluna específica
        const listaContainer = coluna.querySelector(".noticias-lista"); 

        // Salta para a próxima coluna do loop caso a categoria não tenha sido informada ou a div contêiner não exista
        if (!editoria || !listaContainer) continue;

        try {

            // Faz a requisição para obter as notícias da editoria atual
            // Requisita à API backend até 3 notícias recentes filtradas pela editoria atual, tratando caracteres especiais com encodeURIComponent
            const res = await fetch(`../api/noticias?editoria=${encodeURIComponent(editoria)}&limit=3`); 

            // Se a chamada à API para esta editoria falhar (ex: erro 500), ignora e avança para a próxima coluna
            if (!res.ok) continue;

            // Converte a resposta em formato JSON para um array de objetos de notícias do JavaScript
            const noticias = await res.json(); 

            // Limpa o conteúdo do contêiner da coluna para remover resíduos visuais ou loaders antigos
            listaContainer.innerHTML = ""; 

            // Verifica se a API retornou um array sem notícias cadastradas para aquela categoria
            if (noticias.length === 0) {
                // Injeta uma mensagem textual no contêiner informando a ausência de matérias para aquela categoria
                listaContainer.innerHTML = "<p class='sem-noticias'>Nenhuma notícia encontrada.</p>";
                // Salta para o próximo ciclo do loop sem tentar renderizar cards
                continue;
            }

            // Percorre cada objeto de notícia retornado pelo banco de dados para criar os elementos visuais
            noticias.forEach(noticia => {

                // Faz uma cópia profunda (cloneNode(true)) da estrutura DOM definida dentro da tag <template>
                const clone = template.content.cloneNode(true); 

                // Captura a div do card dentro da cópia do template
                const item = clone.querySelector(".noticia-por-editoria-1"); 
                // Captura a tag <img> dentro da cópia do template
                const img = clone.querySelector("img"); 
                // Captura o elemento de título (<h3>) dentro da cópia do template
                const titulo = clone.querySelector(".noticia-titulo"); 

                // Se a tag <img> existir no clone, atribui o link da imagem retornado do banco ou define uma imagem substituta padrão
                if (img) {
                    img.src = noticia.imagemUrl || "https://us.123rf.com/450wm/koblizeek/koblizeek2204/koblizeek220400315/185376169-nenhum-s%C3%ADmbolo-do-vetor-da-imagem-%C3%ADcone-dispon%C3%ADvel-ausente-nenhuma-galeria-para-este-espa%C3%A7o.jpg?ver=6";
                    img.alt = noticia.titulo;
                }

                // Se o elemento de título existir no clone, atribui o texto da manchete da notícia
                if (titulo) {
                    titulo.textContent = noticia.titulo;
                }

                // Se o contêiner do card existir no clone, adiciona o manipulador do evento de clique
                if (item) {
                    item.onclick = () => {
                        // Redireciona o navegador para a página de leitura da notícia passando seu ID único do MongoDB via URL
                        window.location.href = `../html/noticia-pagina.html?id=${noticia._id}`;
                    }
                }

                // Insere a cópia do template devidamente preenchida dentro da div contêiner da coluna atual
                listaContainer.appendChild(clone);
            });

        } catch (err) {
            console.error(`Erro ao carregar editorias: ${editoria}`, err);
        }
    }
}

