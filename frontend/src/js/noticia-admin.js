import { API_URL, OPCOES_EDITORIA } from './config.js';

const LIMITE_POR_PAGINA = 10;

// Armazena o HTML original das linhas em edição para permitir a ação de cancelar
const linhasEmEdicao = {};

let paginaAtual = 1;
let totalPaginas = 1;

document.addEventListener(`DOMContentLoaded`, async () => {
    configurarEventosPaginacao(); // Inicializa os botões de paginação
    configurarEventosManutencao(); // Inicializa os botões do Painel KPI
    await carregarPainelMetricas(); 
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

// Configura os botões de Importar RSS e Limpar Banco
function configurarEventosManutencao() {

    const btnImportar = document.getElementById("btn-importar-rss");
    const btnLimpar = document.getElementById("btn-limpar-banco");

    if (btnImportar) {
        btnImportar.addEventListener("click", executarImportacaoRss);
    }

    if (btnLimpar) {
        btnLimpar.addEventListener("click", executarLimpezaBanco);
    }
}

// 1. Ação de Importar Notícias das Fontes Oficiais (POST /automacao/importar)
async function executarImportacaoRss() {

    const btn = document.getElementById("btn-importar-rss");
    if (!btn) return;

    // Estado de Processamento (Disabled + Spinner)
    const htmlOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> Importando Notícias...`;

    atualizarCardStatus("Importando...", "Buscando dados no TSE, Agência Câmara e Agência Brasil", "Processando");

    try {

        const resposta = await fetch("/automacao/importar", { method: "POST" });
        if (!resposta.ok) {
            throw new Error(`Erro na importação: ${resposta.status}`);
        }

        const dados = await resposta.json();

        // Atualiza a interface com o resumo vindo do backend
        if (dados.resumo) {
            atualizarCardStatus(
                `+${dados.resumo.totalImportadas} Novas`,
                `${dados.resumo.totalAnalissadas || dados.resumo.totalAnalisadas} analisadas | ${dados.resumo.totalIgnoradas} duplicadas`,
                "Concluído"
            );
        }

        // Recarrega a tabela de notícias e os contadores do topo
        paginaAtual = 1;
        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao importar notícias:", error);
        atualizarCardStatus("Erro!", "Falha ao conectar com o serviço RSS", "Falhou");
        alert("Não foi possível importar as notícias.");

    } finally {
        btn.disabled = false;
        btn.innerHTML = htmlOriginal;
    }
}

// 2. Ação de Limpar Banco Mantendo Limite definido (DELETE /manutencao/limpar-database)
async function executarLimpezaBanco() {

    if (!confirm("Deseja executar a limpeza da base de dados para manter o limite de 100 notícias?")) return;

    const btn = document.getElementById("btn-limpar-banco");
    if (!btn) return;

    const htmlOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> Limpando...`;

    try {

        const resposta = await fetch("/manutencao/limpar-database", { method: "DELETE" });
        if (!resposta.ok) {
            throw new Error(`Erro na limpeza: ${resposta.status}`);
        }

        const dados = await resposta.json();

        // Atualiza as métricas no topo
        atualizarCardStatus(
            `${dados.removidas} Removidas`,
            dados.mensagem || `Base mantida em ${dados.totalAtual} notícias`,
            "Otimizado"
        );

        paginaAtual = 1;
        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao limpar banco:", error);
        alert("Não foi possível executar a limpeza do banco.");

    } finally {
        btn.disabled = false;
        btn.innerHTML = htmlOriginal;
    }
}

// Auxiliar para atualizar o 3º Card ("Última Operação")
function atualizarCardStatus(titulo, subtexto, badge) {
    const elTitulo = document.getElementById("kpi-status-operacao");
    const elSubtexto = document.getElementById("kpi-detalhe-operacao");
    const elBadge = document.getElementById("badge-tempo-operacao");

    if (elTitulo) elTitulo.textContent = titulo;
    if (elSubtexto) elSubtexto.textContent = subtexto;
    if (elBadge) elBadge.textContent = badge;
}

async function carregarTabelaNoticias() {

    const corpoTabela = document.getElementById(`corpo-tabela-noticias`);
    const kpiTotal = document.getElementById("kpi-total-noticias");
    if (!corpoTabela) return;

    try {

        const dadosPaginados = await buscarNoticiasPaginadas(paginaAtual, LIMITE_POR_PAGINA);

        const listaNoticias = dadosPaginados.noticias || [];
        totalPaginas = dadosPaginados.totalPaginas || 1;

        if (listaNoticias.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">Nenhuma notícia cadastrada.</td>
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
                <td colspan="7" style="text-align: center; color: red;">Erro ao carregar notícias. Tente recarregar a página.</td>
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

// Constrói a linha com os botões de ação e anexa os eventos
function criarLinhaNoticia(noticia) {

    const tr = document.createElement("tr");
    tr.id = `linha-noticia-${noticia._id}`;

    const conteudoResumido = noticia.conteudo && noticia.conteudo.length > 40 
        ? noticia.conteudo.substring(0, 40) + "..." 
        : (noticia.conteudo || "");

    const linhaFinaResumida = noticia.linhaFina && noticia.linhaFina.length > 20
        ? noticia.linhaFina.substring(0, 20) + "..."
        : (noticia.linhaFina || ""); 

    tr.innerHTML = `
        <td class="col-editoria">${noticia.editoria || 'Geral'}</td>
        <td class="col-chapeu">${noticia.chapeu || '-'}</td>
        <td class="col-titulo">${noticia.titulo || '-'}</td>
        <td class="col-linhaFina">${linhaFinaResumida || '-'}</td>
        <td class="col-autor">${noticia.autor || '-'}</td>
        <td class="col-conteudo">${conteudoResumido || '-'}</td>
        <td class="col-acoes">
            <div class="acoes-wrapper">
                <button class="btn-acao btn-editar" title="Editar Notícia">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-acao btn-deletar" title="Excluir Notícia">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;

    // Armazena a notícia tratando valores nulos
    tr.dataset.noticia = JSON.stringify(noticia);

    // Eventos dos botões
    const btnEditar = tr.querySelector(".btn-editar");
    const btnDeletar = tr.querySelector(".btn-deletar");

    btnEditar.addEventListener("click", () => ativarModoEdicao(noticia._id));
    btnDeletar.addEventListener("click", () => deletarNoticia(noticia._id));

    return tr;
}

// 1. Ativa o modo de edição
function ativarModoEdicao(id) {

    const tr = document.getElementById(`linha-noticia-${id}`);
    if (!tr) return;

    let noticia;
    try {
        noticia = JSON.parse(tr.dataset.noticia);
    } catch (e) {
        console.error("Erro ao ler dados da notícia:", e);
        return;
    }

    // Salva o HTML original caso cancele
    linhasEmEdicao[id] = tr.innerHTML;

    // Constrói o <select>
    const editoriaAtual = (noticia.editoria || "").toLowerCase();
    const opcoesSelect = OPCOES_EDITORIA.map(ed => 
        `<option value="${ed}" ${editoriaAtual === ed.toLowerCase() ? 'selected' : ''}>${ed}</option>`
    ).join("");

    // Trata aspas duplas nos textos para não quebrar os inputs
    const chapeu = (noticia.chapeu || "").replace(/"/g, '&quot;');
    const titulo = (noticia.titulo || "").replace(/"/g, '&quot;');
    const linhaFina = (noticia.linhaFina || "").replace(/"/g, '&quot;');
    const autor = (noticia.autor || "").replace(/"/g, '&quot;');
    const conteudo = (noticia.conteudo || "").replace(/"/g, '&quot;');

    tr.innerHTML = `
        <td>
            <select id="edit-editoria-${id}">
                ${opcoesSelect}
            </select>
        </td>
        <td><input type="text" id="edit-chapeu-${id}" value="${chapeu}"></td>
        <td><input type="text" id="edit-titulo-${id}" value="${titulo}"></td>
        <td><input type="text" id="edit-linhaFina-${id}" value="${linhaFina}"></td>
        <td><input type="text" id="edit-autor-${id}" value="${autor}"></td>
        <td><input type="text" id="edit-conteudo-${id}" value="${conteudo}"></td>
        <td class="col-acoes">
            <div class="acoes-wrapper">
                <button class="btn-acao btn-salvar" title="Salvar Alterações">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn-acao btn-cancelar" title="Cancelar Edição">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </td>
    `;

    // Eventos de Salvar e Cancelar
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
        if (!resposta.ok) {
            throw new Error("Erro ao excluir notícia"); 
        }

        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao deletar notícia:", error);
        alert("Não foi possível excluir a notícia.");
    }
}

/**
 * Consome o endpoint /admin/metricas e distribui os dados pelos Cards do topo
 */
async function carregarPainelMetricas() {

    const metricaTotalNoticias = document.getElementById("kpi-total-noticias");
    const metricaLimiteNoticias = document.getElementById("kpi-limite-cota");
    const elBtnTextoLimite = document.getElementById("btn-texto-limite");
    
    const metricaTotalFeeds = document.getElementById("kpi-total-feeds");
    const elDetalhePortais = document.getElementById("kpi-detalhe-portais");

    try {
        const resposta = await fetch("/api/admin/metricas");
        if (!resposta.ok) throw new Error(`Status ${resposta.status}`);

        const dados = await resposta.json();

        if (dados.sucesso) {
            // 1. Atualiza Card da Base de Dados (MongoDB)
            if (metricaTotalNoticias) {
                metricaTotalNoticias.textContent = `${dados.bancoDados.totalNoticias}`;
            }

            // Injeta o limite vindo do backend (LIMITE_MAXIMO_NOTICIAS_DATABASE)
            if (metricaLimiteNoticias) {
                metricaLimiteNoticias.textContent = `${dados.bancoDados.limiteCota}`;
            }

            if (elBtnTextoLimite) {
                elBtnTextoLimite.textContent = `Limpar Banco (Limite ${dados.bancoDados.limiteCota})`;
            }

            // 2. Atualiza Card da Sincronização RSS
            if (metricaTotalFeeds) {
                metricaTotalFeeds.textContent = `${dados.rss.totalFeeds} Feeds RSS`;
            }

            if (elDetalhePortais) {
                elDetalhePortais.textContent = dados.rss.subtextoFormatado;
            }
        }
        
    } catch (error) {
        console.error("Erro ao carregar /api/admin/metricas:", error);
    }
}


