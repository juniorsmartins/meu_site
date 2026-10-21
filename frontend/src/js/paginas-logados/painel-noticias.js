import { 
    API_URL_ADMIN_METRICAS,
    API_URL_ADMIN_IMPORTAR_NOTICIA, 
    API_URL_ADMIN_LIMPAR_DATABASE, 
    API_URL_NOTICIAS, 
    OPCOES_EDITORIA,
    LIMITE_NOTICIAS_POR_PAGINA_ADMIN 
} from '../constantsConfig.js';

// Armazena o HTML original das linhas em edição para permitir a ação de cancelar
const linhasEmEdicao = {};

let paginaAtual = 1;
let totalPaginas = 1;

// Variáveis de controle para o estado de confirmação do botão
let aguardandoConfirmacaoLimpeza = false;
let timerConfirmacaoLimpeza = null;

document.addEventListener(`DOMContentLoaded`, async () => {
    configurarEventosPaginacao();
    configurarEventosManutencao();
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

function configurarEventosManutencao() {
    const btnImportarPrincipal = document.getElementById("btn-importar-rss");
    const btnToggleDropdown = document.getElementById("btn-toggle-dropdown-rss");
    const menuDropdown = document.getElementById("menu-dropdown-rss");
    const btnLimpar = document.getElementById("btn-limpar-banco");

    if (btnImportarPrincipal) {
        btnImportarPrincipal.addEventListener("click", () => executarImportacaoRss("TODOS"));
    }

    if (btnToggleDropdown && menuDropdown) {
        btnToggleDropdown.addEventListener("click", (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle("escondido");
        });

        document.addEventListener("click", () => {
            menuDropdown.classList.add("escondido");
        });
    }

    const itensDropdown = document.querySelectorAll(".item-dropdown-rss");
    itensDropdown.forEach(btnItem => {
        btnItem.addEventListener("click", (e) => {
            const portalSelecionado = e.currentTarget.dataset.portal;
            if (menuDropdown) menuDropdown.classList.add("escondido");
            executarImportacaoRss(portalSelecionado);
        });
    });

    if (btnLimpar) {
        btnLimpar.addEventListener("click", executarLimpezaBanco);
    }
}

async function executarImportacaoRss(portal = "TODOS") {
    const btn = document.getElementById("btn-importar-rss");
    const btnArrow = document.getElementById("btn-toggle-dropdown-rss");
    if (!btn) return;

    const htmlOriginal = btn.innerHTML;
    btn.disabled = true;
    if (btnArrow) btnArrow.disabled = true;

    const textoRotulo = (portal && portal !== "TODOS") ? `Importando ${portal}...` : `Importando Notícias...`;
    btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> ${textoRotulo}`;

    atualizarCardStatus("Importando...", `Buscando dados ${portal !== "TODOS" ? `em ${portal}` : "em todos os portais"}`, "Processando");

    try {
        const urlComQuery = portal !== "TODOS" 
            ? `${API_URL_ADMIN_IMPORTAR_NOTICIA}?portal=${encodeURIComponent(portal)}` 
            : API_URL_ADMIN_IMPORTAR_NOTICIA;

        const resposta = await fetch(urlComQuery, { method: "POST" });
        if (!resposta.ok) throw new Error(`Erro na importação: ${resposta.status}`);

        const dados = await resposta.json();

        if (dados.resumo) {
            atualizarCardStatus(
                `+${dados.resumo.totalImportadas} Novas`,
                `${dados.resumo.totalAnalisadas} analisadas | ${dados.resumo.totalIgnoradas} duplicadas`,
                "Concluído"
            );
        }

        paginaAtual = 1;
        await carregarPainelMetricas();
        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao importar notícias:", error);
        atualizarCardStatus("Erro!", "Falha ao conectar com o serviço RSS", "Falhou");
        alert("Não foi possível importar as notícias.");

    } finally {
        btn.disabled = false;
        if (btnArrow) btnArrow.disabled = false;
        btn.innerHTML = htmlOriginal;
    }
}

async function executarLimpezaBanco() {
    const btn = document.getElementById("btn-limpar-banco");
    if (!btn) return;

    if (!aguardandoConfirmacaoLimpeza) {
        aguardandoConfirmacaoLimpeza = true;
        btn.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Clique p/ Confirmar`;
        btn.classList.add("btn-confirmando");

        timerConfirmacaoLimpeza = setTimeout(() => {
            resetarBotaoLimpeza(btn);
        }, 4000);

        return;
    }

    clearTimeout(timerConfirmacaoLimpeza);
    aguardandoConfirmacaoLimpeza = false;

    btn.disabled = true;
    btn.classList.remove("btn-confirmando");
    btn.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> Limpando...`;

    atualizarCardStatus("Limpando...", "Removendo registros excedentes", "Processando");

    try {
        const resposta = await fetch(API_URL_ADMIN_LIMPAR_DATABASE, { method: "DELETE" });
        
        if (!resposta.ok) {
            throw new Error(`Erro na limpeza: ${resposta.status}`);
        }

        const dados = await resposta.json();

        atualizarCardStatus(
            `${dados.removidas} Removidas`,
            dados.mensagem || `Base mantida em ${dados.totalAtual} notícias`,
            "Otimizado"
        );

        paginaAtual = 1;
        await carregarPainelMetricas();
        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao limpar banco:", error);
        atualizarCardStatus("Erro!", "Falha ao executar limpeza no banco", "Falhou");
        alert("Não foi possível executar a limpeza do banco.");

    } finally {
        resetarBotaoLimpeza(btn);
    }
}

function resetarBotaoLimpeza(btn) {
    aguardandoConfirmacaoLimpeza = false;
    if (timerConfirmacaoLimpeza) clearTimeout(timerConfirmacaoLimpeza);
    
    btn.disabled = false;
    btn.classList.remove("btn-confirmando");
    btn.innerHTML = `<i class="bi bi-trash3-fill"></i> Limpar Banco`;
}

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
        const dadosPaginados = await buscarNoticiasPaginadas(paginaAtual, LIMITE_NOTICIAS_POR_PAGINA_ADMIN);

        const listaNoticias = dadosPaginados.noticias || [];
        totalPaginas = dadosPaginados.totalPaginas || 1;

        if (kpiTotal && dadosPaginados.totalNoticias !== undefined) {
            kpiTotal.textContent = `${dadosPaginados.totalNoticias}`;
        }

        if (listaNoticias.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">Nenhuma notícia cadastrada.</td>
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
                <td colspan="8" style="text-align: center; color: red;">Erro ao carregar notícias. Tente recarregar a página.</td>
            </tr>
        `;
    }
}

async function buscarNoticiasPaginadas(pagina, limite) {
    const response = await fetch(`${API_URL_NOTICIAS}?pagina=${pagina}&limite=${limite}`);
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

// MODIFICAÇÃO: Criação da linha com os botões de Manchete (Estrela) e Destaque (Bookmark)
function criarLinhaNoticia(noticia) {
    const tr = document.createElement("tr");
    tr.id = `linha-noticia-${noticia._id}`;

    const linhaFinaResumida = noticia.linhaFina && noticia.linhaFina.length > 20
        ? noticia.linhaFina.substring(0, 20) + "..."
        : (noticia.linhaFina || ""); 

    const btnManchete = noticia.destaquePrincipal 
        ? `<button class="btn-toggle-status btn-manchete-ativo" title="Remover Manchete"><i class="bi bi-star-fill"></i> Sim</button>`
        : `<button class="btn-toggle-status btn-status-inativo" title="Definir como Manchete"><i class="bi bi-star"></i> Não</button>`;

    const btnDestaque = noticia.destaqueSecundario
        ? `<button class="btn-toggle-status btn-destaque-ativo" title="Remover Destaque"><i class="bi bi-bookmark-check-fill"></i> Sim</button>`
        : `<button class="btn-toggle-status btn-status-inativo" title="Definir como Destaque"><i class="bi bi-bookmark"></i> Não</button>`;

    tr.innerHTML = `
        <td class="col-editoria">${noticia.editoria || 'Geral'}</td>
        <td class="col-chapeu">${noticia.chapeu || '-'}</td>
        <td class="col-titulo">${noticia.titulo || '-'}</td>
        <td class="col-linhaFina">${linhaFinaResumida || '-'}</td>
        <td class="col-autor">${noticia.autor || '-'}</td>
        <td class="col-manchete text-center">${btnManchete}</td>
        <td class="col-destaque text-center">${btnDestaque}</td>
        <td class="col-acoes text-center">
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

    tr.dataset.noticia = JSON.stringify(noticia);

    const btnEditar = tr.querySelector(".btn-editar");
    const btnDeletar = tr.querySelector(".btn-deletar");

    btnEditar.addEventListener("click", () => ativarModoEdicao(noticia._id));
    btnDeletar.addEventListener("click", () => deletarNoticia(noticia._id));

    // Eventos de clique direto nos botões de destaque da tabela
    const elBtnManchete = tr.querySelector(".col-manchete button");
    const elBtnDestaque = tr.querySelector(".col-destaque button");

    if (elBtnManchete) {
        elBtnManchete.addEventListener("click", () => alternarStatusDestaque(noticia._id, "MANCHETE"));
    }

    if (elBtnDestaque) {
        elBtnDestaque.addEventListener("click", () => alternarStatusDestaque(noticia._id, "DESTAQUE"));
    }

    return tr;
}

// MODIFICAÇÃO: Lógica para alternar destaque com exclusividade mútua (Manchete OU Destaque)
async function alternarStatusDestaque(idNoticia, tipoAcao) {
    try {
        const tr = document.getElementById(`linha-noticia-${idNoticia}`);
        if (!tr) return;

        const noticiaOriginal = JSON.parse(tr.dataset.noticia);

        let novoDestaquePrincipal = noticiaOriginal.destaquePrincipal || false;
        let novoDestaqueSecundario = noticiaOriginal.destaqueSecundario || false;

        if (tipoAcao === "MANCHETE") {
            novoDestaquePrincipal = !noticiaOriginal.destaquePrincipal;
            if (novoDestaquePrincipal) {
                novoDestaqueSecundario = false;
            }
        } else if (tipoAcao === "DESTAQUE") {
            novoDestaqueSecundario = !noticiaOriginal.destaqueSecundario;
            if (novoDestaqueSecundario) {
                novoDestaquePrincipal = false;
            }
        }

        const dadosAtualizados = {
            ...noticiaOriginal,
            destaquePrincipal: novoDestaquePrincipal,
            destaqueSecundario: novoDestaqueSecundario
        };

        const resposta = await fetch(`${API_URL_NOTICIAS}/${idNoticia}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });

        if (!resposta.ok) throw new Error("Erro ao atualizar destaque");

        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao alterar destaque da notícia:", error);
        alert("Não foi possível atualizar o destaque da notícia.");
    }
}

// MODIFICAÇÃO: Modo de edição em linha com controle de seleções exclusivas
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

    linhasEmEdicao[id] = tr.innerHTML;

    const editoriaAtual = (noticia.editoria || "").toLowerCase();
    const opcoesSelect = OPCOES_EDITORIA.map(ed => 
        `<option value="${ed}" ${editoriaAtual === ed.toLowerCase() ? 'selected' : ''}>${ed}</option>`
    ).join("");

    const chapeu = (noticia.chapeu || "").replace(/"/g, '&quot;');
    const titulo = (noticia.titulo || "").replace(/"/g, '&quot;');
    const linhaFina = (noticia.linhaFina || "").replace(/"/g, '&quot;');
    const autor = (noticia.autor || "").replace(/"/g, '&quot;');

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
        <td class="text-center">
            <input type="checkbox" id="edit-manchete-${id}" ${noticia.destaquePrincipal ? 'checked' : ''}>
        </td>
        <td class="text-center">
            <input type="checkbox" id="edit-destaque-${id}" ${noticia.destaqueSecundario ? 'checked' : ''}>
        </td>
        <td class="col-acoes text-center">
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

    // Garante a exclusividade mútua nas checkboxes durante a edição
    const chkManchete = document.getElementById(`edit-manchete-${id}`);
    const chkDestaque = document.getElementById(`edit-destaque-${id}`);

    chkManchete.addEventListener("change", () => {
        if (chkManchete.checked) chkDestaque.checked = false;
    });

    chkDestaque.addEventListener("change", () => {
        if (chkDestaque.checked) chkManchete.checked = false;
    });

    const btnSalvar = tr.querySelector(".btn-salvar");
    const btnCancelar = tr.querySelector(".btn-cancelar");

    btnSalvar.addEventListener("click", () => salvarEdicao(id));
    btnCancelar.addEventListener("click", () => cancelarEdicao(id));
}

function cancelarEdicao(idNoticia) {
    const tr = document.getElementById(`linha-noticia-${idNoticia}`);
    if (!tr || !linhasEmEdicao[idNoticia]) return;

    const noticia = JSON.parse(tr.dataset.noticia);
    const linhaRestaurada = criarLinhaNoticia(noticia);
    
    tr.replaceWith(linhaRestaurada);
    delete linhasEmEdicao[idNoticia];
}

async function salvarEdicao(idNoticia) {
    const tr = document.getElementById(`linha-noticia-${idNoticia}`);
    if (!tr) return;

    const noticiaOriginal = JSON.parse(tr.dataset.noticia);

    const dadosAtualizados = {
        ...noticiaOriginal,
        editoria: document.getElementById(`edit-editoria-${idNoticia}`).value,
        chapeu: document.getElementById(`edit-chapeu-${idNoticia}`).value,
        titulo: document.getElementById(`edit-titulo-${idNoticia}`).value,
        linhaFina: document.getElementById(`edit-linhaFina-${idNoticia}`).value,
        autor: document.getElementById(`edit-autor-${idNoticia}`).value,
        destaquePrincipal: document.getElementById(`edit-manchete-${idNoticia}`).checked,
        destaqueSecundario: document.getElementById(`edit-destaque-${idNoticia}`).checked
    };

    try {
        const resposta = await fetch(`${API_URL_NOTICIAS}/${idNoticia}`, {
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

async function deletarNoticia(idNoticia) {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;

    try {
        const resposta = await fetch(`${API_URL_NOTICIAS}/${idNoticia}`, { method: "DELETE" });
        if (!resposta.ok) {
            throw new Error("Erro ao excluir notícia"); 
        }

        await carregarTabelaNoticias();

    } catch (error) {
        console.error("Erro ao deletar notícia:", error);
        alert("Não foi possível excluir a notícia.");
    }
}

async function carregarPainelMetricas() {
    const metricaTotalNoticias = document.getElementById("kpi-total-noticias");
    const metricaLimiteNoticias = document.getElementById("kpi-limite-cota");
    const metricaTotalFeeds = document.getElementById("kpi-total-feeds");
    const elDetalhePortais = document.getElementById("kpi-detalhe-portais");

    try {
        const resposta = await fetch(API_URL_ADMIN_METRICAS);
        if (!resposta.ok) throw new Error(`Status ${resposta.status}`);

        const dados = await resposta.json();

        if (dados.sucesso) {
            if (metricaTotalNoticias) {
                metricaTotalNoticias.textContent = `${dados.bancoDados.totalNoticias}`;
            }

            if (metricaLimiteNoticias) {
                metricaLimiteNoticias.textContent = `${dados.bancoDados.limiteCota}`;
            }

            if (metricaTotalFeeds) {
                metricaTotalFeeds.textContent = `${dados.rss.totalFeeds} Feeds RSS`;
            }

            if (elDetalhePortais) {
                elDetalhePortais.textContent = dados.rss.subtextoFormatado;
            }
        }
        
    } catch (error) {
        console.error("Erro ao carregar /api/v1/admin/metricas:", error);
    }
}

