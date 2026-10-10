// ============================================================================
// CONFIGURAÇÕES GLOBAIS E ESTRUTURA DAS EDITORIAS (JS-FIRST)
// ============================================================================

// Imagem padrão exibida caso a notícia não possua imagem cadastrada
const IMAGEM_PLACEHOLDER = "https://us.123rf.com/450wm/koblizeek/koblizeek2204/koblizeek220400315/185376169-nenhum-s%C3%ADmbolo-do-vetor-da-imagem-%C3%ADcone-dispon%C3%ADvel-ausente-nenhuma-galeria-para-este-espa%C3%A7o.jpg?ver=6";

/**
 * Array de Configuração Central de Editorias (Estratégia JS-First)
 * Permite adicionar, remover ou reordenar colunas do portal modificando apenas este array.
 */
const SECOES_EDITORIAS = [
    // --- Primeira Linha de Colunas (Com Foto) ---
    { titulo: "Política", editoria: "política", comFoto: true, limite: 3 },
    { titulo: "Economia", editoria: "economia", comFoto: true, limite: 3 },
    { titulo: "Tecnologia", editoria: "tecnologia", comFoto: true, limite: 3 },
    { titulo: "Esportes", editoria: "esportes", comFoto: true, limite: 3 },

    // --- Segunda Linha de Colunas ---
    { titulo: "Turismo", editoria: "turismo", comFoto: true, limite: 3 },
    { titulo: "Meio Ambiente", editoria: "meio ambiente", comFoto: true, limite: 3 },
    { titulo: "Saúde", editoria: "saúde", comFoto: true, limite: 3 },
    
    // Coluna especial compacta (sem imagem e com lista expandida)
    { titulo: "Últimas Notícias", editoria: "ultimas", comFoto: false, limite: 10 }
];

// ============================================================================
// PONTO DE ENTRADA (CICLO DE VIDA DA PÁGINA)
// ============================================================================

// Executa a inicialização assim que todo o DOM da página principal for carregado
document.addEventListener("DOMContentLoaded", async () => {
    // Localiza o elemento container na página inicial onde o módulo será inserido
    const containerNoticiasPorEditoria = document.getElementById("container-noticias-por-editoria"); 
    
    // Se o container não existir na página atual, interrompe a execução
    if (!containerNoticiasPorEditoria) return; 

    try {
        // 1. Garante o carregamento do arquivo HTML com os templates
        await garantirEstruturaEditorias(containerNoticiasPorEditoria); 

        // 2. Constrói o grid dinâmico e busca os dados de todas as colunas
        await renderizarTodasAsEditorias();

    } catch (error) {
        console.error("Erro ao inicializar o módulo de noticias por editoria:", error);
    }
});

// ============================================================================
// FUNÇÕES DE MONTAGEM E RENDERIZAÇÃO
// ============================================================================

/**
 * Faz o download do arquivo HTML contendo a estrutura do grid e os templates
 * e o injeta dinamicamente dentro do container da página inicial.
 */
async function garantirEstruturaEditorias(containerNoticiasPorEditoria) {
    // Verifica se o wrapper do grid já foi injetado para evitar requisições duplicadas
    const jaEstaCarregado = document.getElementById("noticias-wraper-2");
    if (jaEstaCarregado) return; 

    // Busca o arquivo HTML que armazena as estruturas de template
    const resposta = await fetch("../html/noticia-editoria.html"); 
    if (!resposta.ok) {
        throw new Error(`Falha ao carregar HTML das editorias: ${resposta.status}`);
    }

    // Injeta o conteúdo baixado no container da página
    containerNoticiasPorEditoria.innerHTML = await resposta.text();
}

/**
 * Percorre o Array de Configuração (SECOES_EDITORIAS), cria o elemento HTML de
 * cada coluna, realiza a busca das notícias no banco e desenha os cards na tela.
 */
async function renderizarTodasAsEditorias() {

    const wrapperGrid = document.getElementById("noticias-wraper-2");
    const templateComFoto = document.getElementById("template-noticia-com-foto");
    const templateSemFoto = document.getElementById("template-noticia-sem-foto");

    // Valida se a estrutura do grid e os templates existem no DOM
    if (!wrapperGrid || !templateComFoto || !templateSemFoto) return;

    // Limpa o conteúdo do wrapper antes de iniciar a montagem
    wrapperGrid.innerHTML = ""; 

    // Itera sequencialmente sobre cada seção configurada no array JS-First
    for (const secao of SECOES_EDITORIAS) {
        
        // 1. Cria a estrutura HTML da coluna (cabeçalho h2 + container da lista)
        const colunaElement = criarElementoColuna(secao);
        wrapperGrid.appendChild(colunaElement);

        // 2. Obtém a referência interna da lista de notícias recém-criada
        const containerLista = colunaElement.querySelector(".noticias-lista");
        
        // 3. Define qual template HTML será utilizado com base na propriedade comFoto
        const templateAdequado = secao.comFoto ? templateComFoto : templateSemFoto;

        // 4. Faz a requisição à API backend para buscar as notícias da coluna
        const noticias = await buscarNoticiasDoBackend(secao);

        // 5. Preenche a coluna na tela com os dados obtidos da API
        renderizarListaEmColuna(containerLista, noticias, templateAdequado, secao.comFoto);
    }
}

/**
 * Cria o elemento container <div> da coluna com seu cabeçalho de título.
 */
function criarElementoColuna(secao) {

    const divColuna = document.createElement("div");
    
    // Adiciona a classe base e uma classe adicional caso a coluna não utilize imagem
    divColuna.className = `noticias-por-editoria ${!secao.comFoto ? 'coluna-sem-foto' : ''}`;
    divColuna.setAttribute("data-editoria", secao.editoria);

    // Define a estrutura interna básica da coluna
    divColuna.innerHTML = `
        <div><h2>${secao.titulo}</h2></div>
        <div class="noticias-lista"></div>
    `;

    return divColuna;
}

// ============================================================================
// COMUNICAÇÃO COM A API (BACKEND)
// ============================================================================

/**
 * Monta a URL de busca adequada e consome a rota da API do MongoDB.
 */
async function buscarNoticiasDoBackend(secao) {

    // URL base definindo a quantidade limite de notícias a retornar
    let url = `/api/noticias?limite=${secao.limite}`;
    
    // Se a coluna for diferente de 'ultimas', inclui o filtro de editoria específica na query
    if (secao.editoria !== "ultimas") {
        url += `&editoria=${encodeURIComponent(secao.editoria)}`;
    }

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) return [];

        const dados = await resposta.json();
        
        // Trata o retorno aceitando tanto arrays diretos quanto objetos paginados
        return Array.isArray(dados) ? dados : (dados.noticias || []);
    } catch (error) {
        console.error(`Erro ao buscar notícias no backend para '${secao.titulo}':`, error);
        return [];
    }
}

// ============================================================================
// MONTAGEM DOS CARDS INDIVIDUAIS
// ============================================================================

/**
 * Insere os cards de notícias clonados dentro da lista da coluna ou exibe mensagem
 * de aviso caso não existam matérias cadastradas.
 */
function renderizarListaEmColuna(containerLista, noticias, template, comFoto) {
    containerLista.innerHTML = ""; // Limpa mensagens anteriores

    // Tratamento para categorias sem notícias cadastradas no banco
    if (noticias.length === 0) {
        containerLista.innerHTML = "<p class='sem-noticias'>Nenhuma notícia encontrada.</p>";
        return;
    }

    // Cria e anexa o card para cada notícia retornada pela API
    noticias.forEach(noticia => {
        const card = criarCardNoticia(noticia, template, comFoto);
        containerLista.appendChild(card);
    });
}

/**
 * Clona o template do HTML (<template>), preenche os dados (título, foto e evento de clique)
 * e retorna o elemento pronto para renderização.
 */
function criarCardNoticia(noticia, template, comFoto) {

    // Clona a árvore de nós do template indicado
    const clone = template.content.cloneNode(true);
    
    const cardElement = clone.querySelector(".noticia-card");
    const tituloElement = clone.querySelector(".noticia-titulo");

    // Preenche o texto do título da manchete
    if (tituloElement) {
        tituloElement.textContent = noticia.titulo;
    }

    // Se o card for do tipo com foto, preenche as propriedades de imagem
    if (comFoto) {
        const imagemElement = clone.querySelector("img");
        if (imagemElement) {
            imagemElement.src = noticia.imagemUrl || IMAGEM_PLACEHOLDER;
            imagemElement.alt = noticia.titulo;
        }
    }

    // Configura o redirecionamento ao clicar no card da notícia
    if (cardElement) {
        cardElement.onclick = () => navegarParaNoticia(noticia._id);
    }

    return clone;
}

/**
 * Redireciona o navegador para a página de leitura da notícia enviando o ID por parâmetro na URL.
 */
function navegarParaNoticia(noticiaId) {
    window.location.href = `../html/noticia-pagina.html?id=${noticiaId}`;
}

