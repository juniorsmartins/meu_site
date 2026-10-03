const API_URL = `/api/noticias`;

document.addEventListener(`DOMContentLoaded`, async () => {
    await carregarTabelaNoticias();
});

async function carregarTabelaNoticias() {

    const corpoTabela = document.getElementById(`corpo-tabela-noticias`);
    if (!corpoTabela) return;

    try {
        const listaNoticias = await buscarTodasNoticias();

        if (listaNoticias.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">Nenhuma notícia cadastrada.</td>
                </tr>
            `;
            return;
        }

        renderizarLinhasTabela(corpoTabela, listaNoticias);

    } catch (error) {
        console.error(`Erro ao carregar tabela de notícias:`, error);
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red;">Erro ao carregar notícias. Tente recarregar a página.</td>
            </tr>
        `;
    }
}

async function buscarTodasNoticias() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Falha na requisição: ${response.status}`);
    }

    return await response.json();
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

    tr.innerHTML = `
        <td><strong>${noticia.editoria || 'Geral'}</strong></td>
        <td>${noticia.chapeu || '-'}</td>
        <td>${noticia.titulo || '-'}</td>
        <td>${noticia.linhaFina || '-'}</td>
        <td>${noticia.autor || '-'}</td>
        <td>${conteudoResumido}</td>
    `;

    return tr;
}

