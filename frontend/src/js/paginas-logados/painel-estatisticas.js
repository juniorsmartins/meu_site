import { API_URL_ESTATISTICAS } from '../constantsConfig.js'; 

document.addEventListener("DOMContentLoaded", async () => {
    await carregarDadosPainelAdmin();

    const btnSincronizar = document.getElementById("btnSincronizar");
    if (btnSincronizar) {
        btnSincronizar.addEventListener("click", executarSincronizacao);
    }
});

// Função auxiliar para extrair o token do objeto de sessão do usuário logado
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
        if (!token) {
            throw new Error("Usuário não autenticado ou sessão expirada.");
        }

        // Requisição para o endpoint: GET /api/v1/estatisticas/status
        const resposta = await fetch(`${API_URL_ESTATISTICAS}/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resposta.ok) throw new Error("Erro ao carregar dados administrativos.");

        const resultado = await resposta.json();
        const indicadores = resultado.dados || [];

        // Atualiza os cards de métricas
        document.getElementById("totalIndicadores").textContent = indicadores.length;
        
        if (indicadores.length > 0) {
            const ultimaData = indicadores.reduce((maisRecente, atual) => {
                return new Date(atual.ultimaAtualizacao) > new Date(maisRecente) ? atual.ultimaAtualizacao : maisRecente;
            }, indicadores[0].ultimaAtualizacao);

            document.getElementById("ultimaAtualizacao").textContent = new Date(ultimaData).toLocaleString('pt-BR');
        } else {
            document.getElementById("ultimaAtualizacao").textContent = "Nunca sincronizado";
        }

        // Preenche a tabela
        const tbody = document.getElementById("tabelaIndicadoresBody");
        tbody.innerHTML = "";

        if (indicadores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #777;">Nenhum indicador encontrado. Clique em "Sincronizar" para buscar os dados.</td></tr>`;
            return;
        }

        indicadores.forEach(ind => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${ind.titulo}</strong></td>
                <td><code>${ind.slug}</code></td>
                <td>${ind.fonte}</td>
                <td>${ind.unidade}</td>
                <td>${ind.anos ? ind.anos.length : 0} períodos</td>
                <td><span class="status-badge">Sincronizado</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao buscar status do painel:", error);
        document.getElementById("tabelaIndicadoresBody").innerHTML = `<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Erro ao carregar dados do servidor.</td></tr>`;
    }
}

async function executarSincronizacao() {
    const btnSincronizar = document.getElementById("btnSincronizar");
    const icone = btnSincronizar.querySelector("i");
    
    try {
        if (!confirm("Deseja buscar os dados mais recentes nas APIs oficiais do IBGE e Banco Central? Isso pode levar alguns segundos.")) {
            return;
        }

        // Estado de carregamento
        btnSincronizar.disabled = true;
        icone.classList.add("bi-spin");
        btnSincronizar.innerHTML = `<i class="bi bi-arrow-repeat bi-spin"></i> Sincronizando...`;

        const token = obterTokenAdmin();
        if (!token) {
            throw new Error("Token de autorização não encontrado. Faça login novamente.");
        }

        // Requisição para o endpoint: POST /api/v1/estatisticas/sincronizar
        const resposta = await fetch(`${API_URL_ESTATISTICAS}/sincronizar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao executar sincronização.");
        }

        alert("Sincronização realizada com sucesso! Os dados foram atualizados no banco.");
        await carregarDadosPainelAdmin(); // Recarrega os dados na tela

    } catch (error) {
        console.error("Erro na sincronização:", error);
        alert(`Falha na sincronização: ${error.message}`);
    } finally {
        btnSincronizar.disabled = false;
        btnSincronizar.innerHTML = `<i class="bi bi-arrow-repeat"></i> Sincronizar com Fontes Externas`;
    }
}

