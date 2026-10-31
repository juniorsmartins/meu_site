import { API_URL_ESTATISTICAS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas de infraestrutura.");

        const resultado = await resposta.json();
        const dados = resultado.dados || {};

        // 1. Gráfico de Linhas Duplas: Água e Esgoto (Saneamento)
        // O backend enviará { anos: [], agua: [], esgoto: [] }
        if (dados.saneamento && dados.saneamento.anos && dados.saneamento.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoSaneamento', 
                dados.saneamento.anos, 
                dados.saneamento.agua || [], 
                dados.saneamento.esgoto || [], 
                'Água Tratada', 
                'Coleta de Esgoto',
                '#2196F3', // Azul para água
                '#8E44AD'  // Roxo para esgoto
            );
        }

        // 2. Gráfico de Linha: Energia Elétrica
        if (dados.energia && dados.energia.anos && dados.energia.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoEnergia', 
                dados.energia.anos, 
                dados.energia.valores, 
                'Acesso à Energia (%)', 
                '#F39C12', 
                '#FEF9E7', 
                '%'
            );
        }

        // 3. Gráfico de Linha: Internet
        if (dados.internet && dados.internet.anos && dados.internet.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoInternet', 
                dados.internet.anos, 
                dados.internet.valores, 
                'Usuários de Internet (%)', 
                '#16A085', 
                '#E8F8F5', 
                '%'
            );
        }

        // 4. Gráfico de Linha: Passageiros Aéreos
        if (dados.aereo && dados.aereo.anos && dados.aereo.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoAereo', 
                dados.aereo.anos, 
                dados.aereo.valores, 
                'Passageiros (Milhões)', 
                '#D35400', 
                '#FADBD8'
            );
        }

    } catch (error) {
        console.error("Erro ao carregar gráficos de infraestrutura:", error);
    }
});

// ==========================================
// FUNÇÕES DE RENDERIZAÇÃO DO CHART.JS
// ==========================================

function renderizarGraficoLinha(canvasId, rotulos, dados, labelDataset, corPrincipal, corFundo, prefixo = '') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: rotulos,
            datasets: [{
                label: labelDataset,
                data: dados,
                borderColor: corPrincipal,
                backgroundColor: corFundo,
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: corPrincipal,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let valor = context.raw;
                            if (valor !== null && valor !== undefined) {
                                return `${prefixo}${valor.toString().replace('.', ',')}`;
                            }
                            return 'Sem dados';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderizarGraficoLinhasDuplas(canvasId, rotulos, dados1, dados2, label1, label2, cor1, cor2) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: rotulos,
            datasets: [
                {
                    label: label1,
                    data: dados1,
                    borderColor: cor1,
                    backgroundColor: `${cor1}1A`, // Adiciona transparência
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: label2,
                    data: dados2,
                    borderColor: cor2,
                    backgroundColor: `${cor2}1A`,
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

