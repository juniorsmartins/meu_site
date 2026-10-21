document.addEventListener("DOMContentLoaded", () => {
    // Série histórica anual fictícia simulando dados do IBGE e Banco Central
    const anosHistoricos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

    // Dados fictícios simulados
    const dadosFicticios = {
        pib: [1.8, 1.2, -3.3, 5.0, 3.0, 2.9, 2.5, 2.2],
        desemprego: [12.3, 11.9, 13.5, 13.2, 9.6, 7.8, 7.1, 6.8],
        ipca: [3.75, 4.31, 4.52, 10.06, 5.79, 4.62, 4.15, 3.90],
        selic: [6.50, 4.50, 2.00, 9.25, 13.75, 11.75, 10.50, 11.25]
    };

    renderizarGraficoLinha('graficoPib', anosHistoricos, dadosFicticios.pib, 'Crescimento do PIB (%)', '#0D47A1', '#E3F2FD');
    renderizarGraficoLinha('graficoDesemprego', anosHistoricos, dadosFicticios.desemprego, 'Desemprego (%)', '#D32F2F', '#FDEDEC');
    renderizarGraficoLinha('graficoIpca', anosHistoricos, dadosFicticios.ipca, 'IPCA / Inflação (%)', '#F39C12', '#FEF9E7');
    renderizarGraficoLinha('graficoSelic', anosHistoricos, dadosFicticios.selic, 'Taxa Selic (%)', '#27AE60', '#EAFAF1');
});

function renderizarGraficoLinha(canvasId, rotulos, dados, labelDataset, corPrincipal, corFundo) {
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
                tension: 0.3, /* Curva suave nas linhas */
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

