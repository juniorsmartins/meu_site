const API_URL = `/api/noticias`;

let paginaAtual = 1;
let totalPaginas = 1;
const LIMITE_POR_PAGINA = 8;

document.addEventListener(`DOMContentLoaded`, async () => {
    configurarEventosPaginacao();
    await carregarTabelaNoticias();
});

function configurarEventosPaginacao() {

    const btnAnterior = document.getElementById("btn-pagina-anterior");
    const btnProxima = document.getElementById("btn-pagina-proxima");

    if (btnAnterior) {
        btnAnterior.addEventListener("click", async () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                await carregarTabelaNoticias();
            }
        });
    }

    if (btnProxima) {
        btnProxima.addEventListener("click", async () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                await carregarTabelaNoticias();
            }
        });
    }
}

async function carregarTabelaNoticias() {

    const corpoTabela = document.getElementById(`corpo-tabela-noticias`);
    if (!corpoTabela) return;

    try {
        const dadosPaginados = await buscarNoticiasPaginadas(paginaAtual, LIMITE_POR_PAGINA); 

        const listaNoticias = dadosPaginados.noticias || []; // Lista de notícias paginadas
        totalPaginas = dadosPaginados.totalPaginas || 1; // Atualiza o total de páginas com base nos dados paginados

        if (listaNoticias.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">Nenhuma notícia cadastrada.</td>
                </tr>
            `;
            atualizarControlesPaginacao(0, 1, 1);
            return;
        }

        renderizarLinhasTabela(corpoTabela, listaNoticias);
        atualizarControlesPaginacao(
            dadosPaginados.totalNoticias, 
            dadosPaginados.paginaAtual, 
            dadosPaginados.totalPaginas
        );

    } catch (error) {
        console.error(`Erro ao carregar tabela de notícias:`, error);
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red;">Erro ao carregar notícias. Tente recarregar a página.</td>
            </tr>
        `;
    }
}

async function buscarNoticiasPaginadas(pagina, limite) {

    const response = await fetch(`${API_URL}?pagina=${pagina}&limite=${limite}`);

    if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.status}`);
    }

    return await response.json();
}

function atualizarControlesPaginacao(totalNoticias, paginaAtual, totalPaginas) {
    const btnAnterior = document.getElementById("btn-pagina-anterior");
    const btnProxima = document.getElementById("btn-pagina-proxima");
    const infoPaginacao = document.getElementById("info-paginacao");

    if (btnAnterior) {
        btnAnterior.disabled = paginaAtual <= 1; // Desabilita o botão anterior se estiver na primeira página
    }

    if (btnProxima) {
        btnProxima.disabled = paginaAtual >= totalPaginas; // Desabilita o botão próxima se estiver na última página
    }

    if (infoPaginacao) {
        infoPaginacao.textContent = `Página ${pagina} de ${totalDePaginas} (${totalNoticias} notícias)`;
    }
}

function renderizarLinhasTabela(corpoTabela, listaNoticias) {
    
    corpoTabela.innerHTML = '';

    listaNoticias.forEach(noticia => {
        const linha = criarLinhaNoticia(noticia);
        corpoTabela.appendChild(linha);
    });
}

function criarLinhaNoticia(noticia) {

    const tr = document.createElement(`tr`);

    const conteudoResumido = noticia.conteudo && noticia.conteudo.length > 40 
        ? noticia.conteudo.substring(0, 40) + '...' 
        : noticia.conteudo;

    const linhaFinaResumida = noticia.linhaFina && noticia.linhaFina.length > 20
        ? noticia.linhaFina.substring(0, 20) + '...'
        : noticia.linhaFina; 

    tr.innerHTML = `
        <td>${noticia.editoria || 'Geral'}</td>
        <td>${noticia.chapeu || '-'}</td>
        <td>${noticia.titulo || '-'}</td>
        <td>${linhaFinaResumida || '-'}</td>
        <td>${noticia.autor || '-'}</td>
        <td>${conteudoResumido || '-'}</td>
    `;

    return tr;
}

