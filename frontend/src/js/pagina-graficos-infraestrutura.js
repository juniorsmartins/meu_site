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

        // 2. Gráfico de Linha: Acesso à Energia
        if (dados.energia_acesso && dados.energia_acesso.anos && dados.energia_acesso.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoEnergiaAcesso', 
                dados.energia_acesso.anos, 
                dados.energia_acesso.valores, 
                'Acesso à Energia (%)', 
                '#F39C12', 
                '#FEF9E7', 
                '%'
            );
        }

        // 3. Gráfico de Linha: Perdas de Energia
        if (dados.energia_perdas && dados.energia_perdas.anos && dados.energia_perdas.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoEnergiaPerdas', 
                dados.energia_perdas.anos, 
                dados.energia_perdas.valores, 
                'Perdas de Energia (%)', 
                '#D32F2F', 
                '#FDEDEC', 
                '%'
            );
        }

        // 4. Gráfico de Linha: Usuários de Internet
        if (dados.internet && dados.internet.anos && dados.internet.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoInternet', 
                dados.internet.anos, 
                dados.internet.valores, 
                'Usuários de Internet (%)', 
                '#16A085', // Verde água
                '#E8F8F5', 
                '%'
            );
        }

        // 5. Gráfico de Linha: Banda Larga
        if (dados.banda_larga && dados.banda_larga.anos && dados.banda_larga.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoBandaLarga', 
                dados.banda_larga.anos, 
                dados.banda_larga.valores, 
                'Banda Larga (por 100 hab.)', 
                '#8E44AD', // Roxo
                '#F4ECF7', 
                '' // Sem prefixo (ex: 12,5 assinaturas)
            );
        }

        // 6. Gráfico de Linha: Transporte Aéreo
        if (dados.passageiros_aereos && dados.passageiros_aereos.anos && dados.passageiros_aereos.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoTransporteAereo', 
                dados.passageiros_aereos.anos, 
                dados.passageiros_aereos.valores, 
                'Passageiros (Milhões)', 
                '#D35400', 
                '#FADBD8', 
                ' milhões'
            );
        }

        // 7. Gráfico de Linha: Malha Rodoviária
        if (dados.malha_rodoviaria && dados.malha_rodoviaria.anos && dados.malha_rodoviaria.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoMalhaRodoviaria', 
                dados.malha_rodoviaria.anos, 
                dados.malha_rodoviaria.valores, 
                'Rodovias Pavimentadas (%)', 
                '#8E44AD', 
                '#F4ECF7', 
                '%'
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

