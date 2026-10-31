import { API_URL_ESTATISTICAS } from '../constantsConfig.js'; 

document.addEventListener("DOMContentLoaded", async () => {
    await carregarDadosPainelAdmin();
    configurarEventosSync();
});

function configurarEventosSync() {
    const btnSincronizar = document.getElementById("btnSincronizar");
    const btnToggleDropdown = document.getElementById("btnToggleDropdownSync");
    const menuDropdown = document.getElementById("menuDropdownSync");

    // Sincronizar Todos (botão principal)
    if (btnSincronizar) {
        btnSincronizar.addEventListener("click", () => executarSincronizacao("TODOS"));
    }

    // Abre/Fecha o menu dropdown
    if (btnToggleDropdown && menuDropdown) {
        btnToggleDropdown.addEventListener("click", (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle("escondido");
        });

        // Fecha ao clicar fora
        document.addEventListener("click", () => {
            menuDropdown.classList.add("escondido");
        });
    }

    // Ação para os itens do dropdown
    const itensDropdown = document.querySelectorAll(".item-dropdown-sync");
    itensDropdown.forEach(btnItem => {
        btnItem.addEventListener("click", (e) => {
            const fonteSelecionada = e.currentTarget.dataset.fonte;
            if (menuDropdown) menuDropdown.classList.add("escondido");
            executarSincronizacao(fonteSelecionada);
        });
    });
}

function obterTokenAdmin() {
    const dadosSessao = localStorage.getItem("gajeiro_usuario");
    if (!dadosSessao) return null;
    try {
        const usuario = JSON.parse(dadosSessao);
        return usuario.token || null;
    } catch (e) {
        return null;
    }
}

async function carregarDadosPainelAdmin() {
    try {
        const token = obterTokenAdmin();
        if (!token) throw new Error("Usuário não autenticado.");

        const resposta = await fetch(`${API_URL_ESTATISTICAS}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar dados.");

        const resultado = await resposta.json();
        const indicadores = resultado.dados || [];

        document.getElementById("totalIndicadores").textContent = indicadores.length;
        
        if (indicadores.length > 0) {
            const ultimaData = indicadores.reduce((maisRecente, atual) => {
                return new Date(atual.ultimaAtualizacao) > new Date(maisRecente) ? atual.ultimaAtualizacao : maisRecente;
            }, indicadores[0].ultimaAtualizacao);
            document.getElementById("ultimaAtualizacao").textContent = new Date(ultimaData).toLocaleString('pt-BR');
        } else {
            document.getElementById("ultimaAtualizacao").textContent = "Nunca sincronizado";
        }

        const tbody = document.getElementById("tabelaIndicadoresBody");
        tbody.innerHTML = "";

        if (indicadores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #777;">Nenhum indicador encontrado.</td></tr>`;
            return;
        }

        indicadores.forEach(ind => {
            const tr = document.createElement("tr");
            
            // Formata a data para o padrão brasileiro (ex: 31/10/2026, 10:18:19)
            const dataFormatada = ind.ultimaAtualizacao 
                ? new Date(ind.ultimaAtualizacao).toLocaleDateString('pt-BR') 
                : 'Nunca sincronizado';

            tr.innerHTML = `
                <td><strong>${ind.titulo}</strong></td>
                <td><code>${ind.slug}</code></td>
                <td>${ind.fonte}</td>
                <td>${ind.unidade}</td>
                <td>${ind.anos ? ind.anos.length : 0} períodos</td>
                <td>${dataFormatada}</td> 
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao buscar status:", error);
        document.getElementById("tabelaIndicadoresBody").innerHTML = `<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Erro ao carregar dados.</td></tr>`;
    }
}

async function executarSincronizacao(fonte = "TODOS") {
    const btnPrincipal = document.getElementById("btnSincronizar");
    const btnArrow = document.getElementById("btnToggleDropdownSync");
    
    try {
        btnPrincipal.disabled = true;
        btnArrow.disabled = true;

        const textoBotao = fonte === "TODOS" ? "Sincronizando Tudo..." : `Sincronizando ${fonte}...`;
        btnPrincipal.innerHTML = `<i class="bi bi-arrow-repeat bi-spin"></i> ${textoBotao}`;

        const token = obterTokenAdmin();
        if (!token) throw new Error("Token não encontrado.");

        // Monta a URL com query string se não for TODOS
        const urlCompleta = fonte === "TODOS" 
            ? `${API_URL_ESTATISTICAS}/sincronizar` 
            : `${API_URL_ESTATISTICAS}/sincronizar?fonte=${encodeURIComponent(fonte)}`;

        const resposta = await fetch(urlCompleta, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.mensagem || "Erro na sincronização.");

        await carregarDadosPainelAdmin();

    } catch (error) {
        console.error("Erro na sincronização:", error);
        alert(error.message || "Não foi possível sincronizar os dados.");
    } finally {
        btnPrincipal.disabled = false;
        btnArrow.disabled = false;
        btnPrincipal.innerHTML = `<i class="bi bi-arrow-repeat"></i> Sincronizar Tudo`;
    }
}

