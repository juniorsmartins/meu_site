import { API_URL_USUARIOS, FUNCOES_USUARIO } from '../constantsConfig.js';

const LIMITE_POR_PAGINA = 10;
let paginaAtual = 1;
let totalPaginas = 1;
const linhasEmEdicao = {};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificação de Segurança no Front-end: Garante que apenas admins acessem
    const dadosSessao = localStorage.getItem("gajeiro_usuario");
    if (!dadosSessao) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "/html/index.html";
        return;
    }

    try {
        const usuario = JSON.parse(dadosSessao);
        if (usuario.funcao !== 'admin') {
            alert("Acesso restrito a administradores.");
            window.location.href = "/html/index.html";
            return;
        }

    } catch (e) {
        window.location.href = "/html/index.html";
        return;
    }

    configurarFiltros();
    configurarPaginacao();
    await carregarTabelaUsuarios();
});

function configurarFiltros() {
    const inputNome = document.getElementById("input-filtro-nome");
    const selectFuncao = document.getElementById("select-filtro-funcao");

    let timeoutBusca = null;

    if (inputNome) {
        inputNome.addEventListener("input", () => {
            clearTimeout(timeoutBusca);
            timeoutBusca = setTimeout(async () => {
                paginaAtual = 1;
                await carregarTabelaUsuarios();
            }, 400);
        });
    }

    if (selectFuncao) {
        selectFuncao.addEventListener("change", async () => {
            paginaAtual = 1;
            await carregarTabelaUsuarios();
        });
    }
}

function configurarPaginacao() {
    const btnAnterior = document.getElementById("btn-pagina-anterior");
    const btnProxima = document.getElementById("btn-pagina-proxima");

    if (btnAnterior) {
        btnAnterior.addEventListener("click", async () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                await carregarTabelaUsuarios();
            }
        });
    }

    if (btnProxima) {
        btnProxima.addEventListener("click", async () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                await carregarTabelaUsuarios();
            }
        });
    }
}

async function carregarTabelaUsuarios() {
    const corpoTabela = document.getElementById("corpo-tabela-usuarios");
    const kpiTotal = document.getElementById("kpi-total-usuarios");
    const inputNome = document.getElementById("input-filtro-nome");
    const selectFuncao = document.getElementById("select-filtro-funcao");

    if (!corpoTabela) return;

    try {
        const nomeFiltro = inputNome ? inputNome.value.trim() : "";
        const funcaoFiltro = selectFuncao ? selectFuncao.value : "";

        let url = `${API_URL_USUARIOS}?pagina=${paginaAtual}&limite=${LIMITE_POR_PAGINA}`;
        if (nomeFiltro) url += `&nome=${encodeURIComponent(nomeFiltro)}`;
        if (funcaoFiltro) url += `&funcao=${encodeURIComponent(funcaoFiltro)}`;

        const usuarioSessao = JSON.parse(localStorage.getItem("gajeiro_usuario"));
        const resposta = await fetch(url, {
            headers: { 'Authorization': `Bearer ${usuarioSessao.token}` }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar lista de usuários.");

        const dados = await resposta.json();
        const listaUsuarios = dados.usuarios || [];
        totalPaginas = dados.totalPaginas || 1;

        if (kpiTotal && dados.totalRegistros !== undefined) {
            kpiTotal.textContent = dados.totalRegistros;
        }

        if (listaUsuarios.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum usuário encontrado.</td></tr>`;
            atualizarControlesPaginacao(0, 1, 1);
            return;
        }

        renderizarLinhas(corpoTabela, listaUsuarios);
        atualizarControlesPaginacao(dados.totalRegistros, dados.paginaAtual, dados.totalPaginas);

    } catch (error) {
        console.error("Erro:", error);
        corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>`;
    }
}

function renderizarLinhas(corpoTabela, lista) {
    corpoTabela.innerHTML = "";
    lista.forEach(usuario => {
        const tr = document.createElement("tr");
        tr.id = `linha-usuario-${usuario._id}`;

        const dataFormatada = usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('pt-BR') : "-";
        const classeBadge = `badge-${usuario.funcao || 'leitor'}`;

        tr.innerHTML = `
            <td>${usuario.nome || '-'}</td>
            <td>${usuario.email || '-'}</td>
            <td><span class="badge-funcao ${classeBadge}">${usuario.funcao || 'leitor'}</span></td>
            <td>${dataFormatada}</td>
            <td class="text-center">
                <div class="acoes-wrapper">
                    <button class="btn-acao btn-editar" title="Editar Usuário"><i class="bi bi-pencil"></i></button>
                    <button class="btn-acao btn-deletar" title="Excluir Usuário"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;

        tr.dataset.usuario = JSON.stringify(usuario);

        tr.querySelector(".btn-editar").addEventListener("click", () => ativarModoEdicao(usuario._id));
        tr.querySelector(".btn-deletar").addEventListener("click", () => deletarUsuario(usuario._id));

        corpoTabela.appendChild(tr);
    });
}

function atualizarControlesPaginacao(total, pagina, totalDePaginas) {
    const btnAnterior = document.getElementById("btn-pagina-anterior");
    const btnProxima = document.getElementById("btn-pagina-proxima");
    const infoPaginacao = document.getElementById("info-paginacao");

    if (btnAnterior) btnAnterior.disabled = pagina <= 1;
    if (btnProxima) btnProxima.disabled = pagina >= totalDePaginas;
    if (infoPaginacao) infoPaginacao.textContent = `Página ${pagina} de ${totalDePaginas} (${total} registros)`;
}

function ativarModoEdicao(id) {
    const tr = document.getElementById(`linha-usuario-${id}`);
    if (!tr) return;

    const usuario = JSON.parse(tr.dataset.usuario);
    linhasEmEdicao[id] = tr.innerHTML;

    const funcoesDisponiveis = Object.values(FUNCOES_USUARIO);
    const opcoesSelect = funcoesDisponiveis.map(f => 
        `<option value="${f}" ${usuario.funcao === f ? 'selected' : ''}>${f}</option>`
    ).join("");

    tr.innerHTML = `
        <td><input type="text" id="edit-nome-${id}" value="${usuario.nome}"></td>
        <td>${usuario.email}</td>
        <td><select id="edit-funcao-${id}">${opcoesSelect}</select></td>
        <td>-</td>
        <td class="text-center">
            <div class="acoes-wrapper">
                <button class="btn-acao btn-salvar" title="Salvar"><i class="bi bi-check-lg"></i></button>
                <button class="btn-acao btn-cancelar" title="Cancelar"><i class="bi bi-x-lg"></i></button>
            </div>
        </td>
    `;

    tr.querySelector(".btn-salvar").addEventListener("click", () => salvarEdicao(id));
    tr.querySelector(".btn-cancelar").addEventListener("click", () => cancelarEdicao(id));
}

function cancelarEdicao(id) {
    const tr = document.getElementById(`linha-usuario-${id}`);
    if (!tr || !linhasEmEdicao[id]) return;

    const usuario = JSON.parse(tr.dataset.usuario);
    const trOriginal = document.createElement("tr");
    trOriginal.id = `linha-usuario-${id}`;
    
    // Restaura HTML original
    carregarTabelaUsuarios();
    delete linhasEmEdicao[id];
}

async function salvarEdicao(id) {
    const tr = document.getElementById(`linha-usuario-${id}`);
    if (!tr) return;

    const novoNome = document.getElementById(`edit-nome-${id}`).value.trim();
    const novaFuncao = document.getElementById(`edit-funcao-${id}`).value;

    try {
        const usuarioSessao = JSON.parse(localStorage.getItem("gajeiro_usuario"));
        const resposta = await fetch(`${API_URL_USUARIOS}/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuarioSessao.token}`
            },
            body: JSON.stringify({ nome: novoNome, funcao: novaFuncao })
        });

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Erro ao atualizar usuário.");

        delete linhasEmEdicao[id];
        await carregarTabelaUsuarios();

    } catch (error) {
        console.error("Erro:", error);
        alert(error.message || "Não foi possível salvar as alterações.");
    }
}

async function deletarUsuario(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
        const usuarioSessao = JSON.parse(localStorage.getItem("gajeiro_usuario"));
        const resposta = await fetch(`${API_URL_USUARIOS}/${id}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${usuarioSessao.token}` }
        });

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Erro ao excluir usuário.");

        await carregarTabelaUsuarios();

    } catch (error) {
        console.error("Erro:", error);
        alert(error.message || "Não foi possível excluir o usuário.");
    }
}

