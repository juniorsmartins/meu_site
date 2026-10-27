import { API_URL_ESTATISTICAS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas do servidor.");

        const resultado = await resposta.json();
        const { pib, desemprego, ipca, selic, divida } = resultado.dados;

        // Renderiza cada gráfico utilizando seus próprios anos e valores de forma independente
        renderizarGraficoLinha('graficoPib', pib.anos, pib.valores, 'Crescimento do PIB (%)', '#0D47A1', '#E3F2FD');
        renderizarGraficoLinha('graficoDesemprego', desemprego.anos, desemprego.valores, 'Desemprego (%)', '#D32F2F', '#FDEDEC');
        renderizarGraficoLinha('graficoIpca', ipca.anos, ipca.valores, 'IPCA / Inflação (%)', '#F39C12', '#FEF9E7');
        renderizarGraficoLinha('graficoSelic', selic.anos, selic.valores, 'Taxa Selic (%)', '#27AE60', '#EAFAF1');
        renderizarGraficoDivida(divida);

    } catch (error) {
        console.error("Erro ao carregar gráficos reais:", error);
    }
});

function renderizarGraficoLinha(canvasId, rotulos, dados, labelDataset, corPrincipal, corFundo) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: rotulos, // Eixo X específico de cada indicador
            datasets: [{
                label: labelDataset,
                data: dados,    // Valores específicos de cada indicador
                borderColor: corPrincipal,
                backgroundColor: corFundo,
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: corPrincipal,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderizarGraficoDivida(dados) {
    // PROTEÇÃO: Se não houver dados ou o array de valores estiver incompleto, não renderiza
    if (!dados || !dados.valores || dados.valores.length < 2) {
        console.warn("[FRONT-END] Dados da Dívida Pública indisponíveis para renderização.");
        return; 
    }

    const ctx = document.getElementById('graficoDivida').getContext('2d');
    
    // Se o gráfico já existir, destrua antes de criar outro (evita sobreposição)
    if (window.chartDivida) window.chartDivida.destroy();

    window.chartDivida = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dados.anos,
            datasets: [
                {
                    label: 'Dívida Líquida',
                    data: dados.valores[0], // Array com os valores da DLSP
                    borderColor: '#0d6efd', // Azul
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    tension: 0.3, // Deixa a linha levemente curvada
                    pointRadius: 3,
                    fill: true // Preenche a área abaixo da linha
                },
                {
                    label: 'Dívida Bruta',
                    data: dados.valores[1], // Array com os valores da DBGG
                    borderColor: '#dc3545', // Vermelho
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
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
                legend: {
                    display: true,
                    position: 'top'
                },
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
                    beginAtZero: false, // A dívida não começa em zero, então false é melhor
                    title: { display: true, text: '% do PIB' }
                }
            }
        }
    });
}

