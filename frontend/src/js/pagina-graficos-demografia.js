import { API_URL_ESTATISTICAS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // ATENÇÃO: Você precisará adicionar esta URL no seu constantsConfig.js
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas demográficas.");

        const resultado = await resposta.json();
        const dados = resultado.dados || {};

        // 1. Gráfico de Barras: População Total
        if (dados.populacao_total && dados.populacao_total.anos && dados.populacao_total.anos.length > 0) {
            renderizarGraficoBarra(
                'graficoPopulacao', 
                dados.populacao_total.anos, 
                dados.populacao_total.valores, 
                'População (Milhões)', 
                '#1976D2'
            );
        }

        // 2. Gráfico de Linha: Crescimento Populacional
        if (dados.crescimento_populacional && dados.crescimento_populacional.anos && dados.crescimento_populacional.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoCrescimentoPop', 
                dados.crescimento_populacional.anos, 
                dados.crescimento_populacional.valores, 
                'Crescimento (%)', 
                '#F39C12', 
                '#FEF9E7', 
                '%'
            );
        }

        // 3. Gráfico de Linhas Duplas: Expectativa de Vida
        // Nota: O backend deverá enviar { anos: [], homens: [], mulheres: [] }
        if (dados.expectativa_vida && dados.expectativa_vida.anos && dados.expectativa_vida.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoExpectativaVida', 
                dados.expectativa_vida.anos, 
                dados.expectativa_vida.mulheres || [], // dados1
                dados.expectativa_vida.homens || [],   // dados2
                'Mulheres',                            // label1
                'Homens'                               // label2
            );
        }

        // 4. Gráfico de Linha: Fecundidade
        if (dados.fecundidade && dados.fecundidade.anos && dados.fecundidade.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoFecundidade', 
                dados.fecundidade.anos, 
                dados.fecundidade.valores, 
                'Filhos por Mulher', 
                '#8E44AD', 
                '#F4ECF7'
            );
        }

        // 5. Gráfico de Linha: Urbanização
        if (dados.urbanizacao && dados.urbanizacao.anos && dados.urbanizacao.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoUrbanizacao', 
                dados.urbanizacao.anos, 
                dados.urbanizacao.valores, 
                'População Urbana (%)', 
                '#16A085', 
                '#E8F8F5', 
                '%'
            );
        }

        // 6. Gráfico de Linha: Mortalidade Infantil
        if (dados.mortalidade_infantil && dados.mortalidade_infantil.anos && dados.mortalidade_infantil.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoMortalidadeInfantil', 
                dados.mortalidade_infantil.anos, 
                dados.mortalidade_infantil.valores, 
                'Mortes / 1000 nascidos', 
                '#D32F2F', 
                '#FDEDEC'
            );
        }

        // 7. Gráfico de Linha: Envelhecimento
        if (dados.envelhecimento && dados.envelhecimento.anos && dados.envelhecimento.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoEnvelhecimento', 
                dados.envelhecimento.anos, 
                dados.envelhecimento.valores, 
                'Índice (%)', 
                '#D35400', 
                '#FADBD8', 
                '%'
            );
        }

        // 8. Gráfico de Linhas Duplas: IDH vs IDHI
        if (dados.idh && dados.idh.anos && dados.idh.anos.length > 0 && dados.idhi && dados.idhi.anos) {
            renderizarGraficoLinhasDuplas(
                'graficoIdh', 
                dados.idh.anos, 
                dados.idh.valores,   // dados1
                dados.idhi.valores,  // dados2
                'IDH',               // label1
                'IDH Ajustado'       // label2
            );
        }

        // 9. Gráfico de Linha: Mortalidade Materna
        if (dados.mortalidade_materna && dados.mortalidade_materna.anos && dados.mortalidade_materna.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoMortalidadeMaterna', 
                dados.mortalidade_materna.anos, 
                dados.mortalidade_materna.valores, 
                'Mortes / 100 mil', 
                '#C0392B', 
                '#FADBD8' 
            );
        }

    } catch (error) {
        console.error("Erro ao carregar gráficos demográficos:", error);
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

function renderizarGraficoBarra(canvasId, rotulos, dados, labelDataset, corPrincipal) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rotulos,
            datasets: [{
                label: labelDataset,
                data: dados,
                backgroundColor: corPrincipal,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} milhões`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderizarGraficoLinhasDuplas(canvasId, rotulos, dados1, dados2, label1, label2) {

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
                    borderColor: '#E91E63', // Rosa/Vermelho
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: label2,
                    data: dados2,
                    borderColor: '#2196F3', // Azul
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
                            return `${context.dataset.label}: ${context.raw} anos`;
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


