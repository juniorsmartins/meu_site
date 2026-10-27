import { API_URL_ESTATISTICAS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas do servidor.");

        const resultado = await resposta.json();
        const { pib, desemprego, ipca, selic, divida_liquida, divida_bruta } = resultado.dados;

        // Renderiza cada gráfico utilizando seus próprios anos e valores de forma independente
        renderizarGraficoLinha('graficoPib', pib.anos, pib.valores, 'Crescimento do PIB (%)', '#0D47A1', '#E3F2FD');
        renderizarGraficoLinha('graficoDesemprego', desemprego.anos, desemprego.valores, 'Desemprego (%)', '#D32F2F', '#FDEDEC');
        renderizarGraficoLinha('graficoIpca', ipca.anos, ipca.valores, 'IPCA / Inflação (%)', '#F39C12', '#FEF9E7');
        renderizarGraficoLinha('graficoSelic', selic.anos, selic.valores, 'Taxa Selic (%)', '#27AE60', '#EAFAF1');
        renderizarGraficoDivida(divida_liquida, divida_bruta);

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

function renderizarGraficoDivida(dividaLiquida, dividaBruta) {

    if (!dividaLiquida || !dividaBruta || !dividaLiquida.anos) {
        console.warn("[FRONT-END] Dados da Dívida Pública indisponíveis para renderização.");
        return; 
    }

    const ctx = document.getElementById('graficoDivida').getContext('2d');

    // Se o gráfico já existir, destrua antes de criar outro (evita sobreposição)
    if (window.chartDivida) window.chartDivida.destroy();

    // Une os anos das duas séries para que o eixo X fique contínuo
    const todosAnos = Array.from(new Set([...liquida.anos, ...bruta.anos])).sort((a, b) => Number(a) - Number(b));

    // Mapeia os valores de cada série para os anos unificados (preenchendo com null onde não houver)
    const dataLiquida = todosAnos.map(ano => {
        const index = liquida.anos.indexOf(ano);
        return index !== -1 ? liquida.valores[index] : null;
    });

    const dataBruta = todosAnos.map(ano => {
        const index = bruta.anos.indexOf(ano);
        return index !== -1 ? bruta.valores[index] : null;
    });

    window.chartDivida = new Chart(ctx, {
        type: 'line',
        data: {
            labels: todosAnos,
            datasets: [
                {
                    label: 'Dívida Líquida',
                    data: dataLiquida,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: true
                },
                {
                    label: 'Dívida Bruta',
                    data: dataBruta,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false // Deixa sem fill para não sobrepor a líquida
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
                    title: { display: true, text: '% do PIB' }
                }
            }
        }
    });
}

