import { API_URL_ESTATISTICAS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas do servidor.");

        const resultado = await resposta.json();
        const { pib, desemprego, ipca, selic } = resultado.dados;

        // Renderiza cada gráfico utilizando seus próprios anos e valores de forma independente
        renderizarGraficoLinha('graficoPib', pib.anos, pib.valores, 'Crescimento do PIB (%)', '#0D47A1', '#E3F2FD');
        renderizarGraficoLinha('graficoDesemprego', desemprego.anos, desemprego.valores, 'Desemprego (%)', '#D32F2F', '#FDEDEC');
        renderizarGraficoLinha('graficoIpca', ipca.anos, ipca.valores, 'IPCA / Inflação (%)', '#F39C12', '#FEF9E7');
        renderizarGraficoLinha('graficoSelic', selic.anos, selic.valores, 'Taxa Selic (%)', '#27AE60', '#EAFAF1');

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

