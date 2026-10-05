import { API_URL, OPCOES_EDITORIA } from './config.js';

const LIMITE_POR_PAGINA = 10;

// Armazena o HTML original das linhas em edição para permitir a ação de cancelar
const linhasEmEdicao = {};

let paginaAtual = 1;
let totalPaginas = 1;

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

        const listaNoticias = dadosPaginados.noticias || [];
        totalPaginas = dadosPaginados.totalPaginas || 1;

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
        atualizarControlesPaginacao(dadosPaginados.totalNoticias, dadosPaginados.paginaAtual, dadosPaginados.totalPaginas);

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

function atualizarControlesPaginacao(totalNoticias, pagina, totalDePaginas) {
    const btnAnterior = document.getElementById("btn-pagina-anterior");
    const btnProxima = document.getElementById("btn-pagina-proxima");
    const infoPaginacao = document.getElementById("info-paginacao");

    if (btnAnterior) btnAnterior.disabled = pagina <= 1;
    if (btnProxima) btnProxima.disabled = pagina >= totalDePaginas;

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

// Constrói a linha com os botões de ação e anexa os manipuladores de evento no JS
function criarLinhaNoticia(noticia) {

    const tr = document.createElement(`tr`); // Cria a linha da tabela
    tr.id = `linha-noticia-${noticia._id}`; // Define um ID único para a linha da tabela

    const linhaFinaResumida = noticia.linhaFina && noticia.linhaFina.length > 20
        ? noticia.linhaFina.substring(0, 20) + '...'
        : noticia.linhaFina; 

    const conteudoResumido = noticia.conteudo && noticia.conteudo.length > 40 
        ? noticia.conteudo.substring(0, 40) + '...' 
        : noticia.conteudo;

    tr.innerHTML = `
        <td class="col-editoria">${noticia.editoria || 'Geral'}</td>
        <td class="col-chapeu">${noticia.chapeu || '-'}</td>
        <td class="col-titulo">${noticia.titulo || '-'}</td>
        <td class="col-linhaFina">${linhaFinaResumida || '-'}</td>
        <td class="col-autor">${noticia.autor || '-'}</td>
        <td class="col-conteudo">${conteudoResumido || '-'}</td>
        <td class="col-acoes">
            <button class="btn-acao btn-editar">
                <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn-acao btn-deletar">
                <i class="bi bi-trash"></i> Excluir
            </button>
        </td>
    `;

    // Armazena o objeto completo na linha
    tr.dataset.noticia = JSON.stringify(noticia);

    // Associa os eventos aos botões
    const btnEditar = tr.querySelector(".btn-editar");
    const btnDeletar = tr.querySelector(".btn-deletar");

    btnEditar.addEventListener("click", () => ativarModoEdicao(noticia._id));
    btnDeletar.addEventListener("click", () => deletarNoticia(noticia._id));

    return tr;
}

// 1. Ativa o modo de edição transformando as células em inputs
function ativarModoEdicao(idNoticia) {

    const tr = document.getElementById(`linha-noticia-${idNoticia}`);
    if (!tr) return; // Se a linha não existir, sai da função

    const noticia = JSON.parse(tr.dataset.noticia); // Recupera o objeto completo da linha

    // Guarda o HTML original caso a edição seja cancelada
    linhasEmEdicao[id] = tr.innerHTML;

    // Gera o <select> com as opções vindas do config.js
    const opcoesSelect = OPCOES_EDITORIA.map(ed => 
        `<option value="${ed}" ${noticia.editoria === ed ? 'selected' : ''}>${ed}</option>`
    ).join("");

    tr.innerHTML = `
        <td>
            <select id="edit-editoria-${id}">
                ${opcoesSelect}
            </select>
        </td>
        <td><input type="text" id="edit-chapeu-${id}" value="${noticia.chapeu || ''}"></td>
        <td><input type="text" id="edit-titulo-${id}" value="${noticia.titulo || ''}"></td>
        <td><input type="text" id="edit-linhaFina-${id}" value="${noticia.linhaFina || ''}"></td>
        <td><input type="text" id="edit-autor-${id}" value="${noticia.autor || ''}"></td>
        <td><input type="text" id="edit-conteudo-${id}" value="${noticia.conteudo || ''}"></td>
        <td class="col-acoes">
            <button class="btn-acao btn-salvar">
                <i class="bi bi-check-circle"></i> Salvar
            </button>
            <button class="btn-acao btn-cancelar">
                <i class="bi bi-x-circle"></i> Cancelar
            </button>
        </td>
    `;

    // Associa os eventos de Salvar e Cancelar aos novos botões
    const btnSalvar = tr.querySelector(".btn-salvar");
    const btnCancelar = tr.querySelector(".btn-cancelar");

    btnSalvar.addEventListener("click", () => salvarEdicao(id));
    btnCancelar.addEventListener("click", () => cancelarEdicao(id));
}

// 2. Cancela a edição e restaura o conteúdo original da linha
function cancelarEdicao(idNoticia) {

    const tr = document.getElementById(`linha-noticia-${idNoticia}`);
    if (!tr || !linhasEmEdicao[idNoticia]) return; // Se não houver edição em andamento, sai da função

    // Recria a linha a partir do objeto mantido no dataset
    const noticia = JSON.parse(tr.dataset.noticia);
    const linhaRestaurada = criarLinhaNoticia(noticia);
    
    tr.replaceWith(linhaRestaurada);
    delete linhasEmEdicao[idNoticia];
}

// 3. Coleta os novos dados e faz a requisição PUT para a API
async function salvarEdicao(idNoticia) {

    const tr = document.getElementById(`linha-noticia-${idNoticia}`);
    if (!tr) return;

    const noticiaOriginal = JSON.parse(tr.dataset.noticia);

    const dadosAtualizados = {
        editoria: document.getElementById(`edit-editoria-${idNoticia}`).value,
        chapeu: document.getElementById(`edit-chapeu-${idNoticia}`).value,
        titulo: document.getElementById(`edit-titulo-${idNoticia}`).value,
        linhaFina: document.getElementById(`edit-linhaFina-${idNoticia}`).value,
        autor: document.getElementById(`edit-autor-${idNoticia}`).value,
        conteudo: document.getElementById(`edit-conteudo-${idNoticia}`).value,
        imagemUrl: noticiaOriginal.imagemUrl
    };

    try {
        const resposta = await fetch(`${API_URL}/${idNoticia}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar alterações");

        delete linhasEmEdicao[idNoticia];
        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao salvar notícia:", error);
        alert("Não foi possível salvar as alterações da notícia.");
    }
}

// 4. Executa a deleção da notícia via DELETE
async function deletarNoticia(idNoticia) {

    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;

    try {
        const resposta = await fetch(`${API_URL}/${idNoticia}`, { method: "DELETE" });

        if (!resposta.ok) throw new Error("Erro ao excluir notícia");

        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao deletar notícia:", error);
        alert("Não foi possível excluir a notícia.");
    }
}



