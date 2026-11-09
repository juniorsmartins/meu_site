import { API_URL_ESTATISTICAS } from '../constantsConfig.js';

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas educacionais.");

        const resultado = await resposta.json();
        const dados = resultado.dados || {};

        // 1. IDEB - Anos Iniciais vs Anos Finais (destaque)
        // Estrutura esperada: { anos: [], anos_iniciais: [], anos_finais: [] }
        if (dados.ideb && dados.ideb.anos && dados.ideb.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoIdeb',
                dados.ideb.anos,
                dados.ideb.anos_iniciais || [],
                dados.ideb.anos_finais || [],
                'Anos Iniciais',
                'Anos Finais',
                '#1565C0', // Azul
                '#2E7D32', // Verde
                ''         // Sem sufixo (é índice 0–10)
            );
        }

        // 2. Taxa de Analfabetismo
        if (dados.analfabetismo && dados.analfabetismo.anos && dados.analfabetismo.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoAnalfabetismo',
                dados.analfabetismo.anos,
                dados.analfabetismo.valores,
                'Analfabetismo (%)',
                '#C62828',
                '#FDEDEC',
                '%'
            );
        }

        // 3. Média de Anos de Estudo
        if (dados.anos_estudo && dados.anos_estudo.anos && dados.anos_estudo.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoAnosEstudo',
                dados.anos_estudo.anos,
                dados.anos_estudo.valores,
                'Anos de Estudo',
                '#1565C0',
                '#E3F2FD',
                '' // Sem sufixo (anos)
            );
        }

        // 4. Taxa de Frequência Líquida
        if (dados.frequencia_liquida && dados.frequencia_liquida.anos && dados.frequencia_liquida.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoFrequenciaLiquida',
                dados.frequencia_liquida.anos,
                dados.frequencia_liquida.valores,
                'Frequência Líquida (%)',
                '#00897B',
                '#E0F2F1',
                '%'
            );
        }

        // 5. Taxa de Aprovação no Ensino Fundamental
        if (dados.aprovacao_fundamental && dados.aprovacao_fundamental.anos && dados.aprovacao_fundamental.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoAprovacao',
                dados.aprovacao_fundamental.anos,
                dados.aprovacao_fundamental.valores,
                'Aprovação (%)',
                '#2E7D32',
                '#E8F5E9',
                '%'
            );
        }

        // 6. Taxa de Conclusão do Ensino Médio
        if (dados.conclusao_medio && dados.conclusao_medio.anos && dados.conclusao_medio.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoConclusaoMedio',
                dados.conclusao_medio.anos,
                dados.conclusao_medio.valores,
                'Conclusão do EM (%)',
                '#6A1B9A',
                '#F3E5F5',
                '%'
            );
        }

        // 7. Investimento Público em Educação
        if (dados.investimento_educacao && dados.investimento_educacao.anos && dados.investimento_educacao.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoInvestimentoEducacao',
                dados.investimento_educacao.anos,
                dados.investimento_educacao.valores,
                'Investimento (% do PIB)',
                '#0277BD',
                '#E1F5FE',
                '%'
            );
        }

        // 8. Evasão Escolar no Ensino Médio
        if (dados.evasao_medio && dados.evasao_medio.anos && dados.evasao_medio.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoEvasaoMedio',
                dados.evasao_medio.anos,
                dados.evasao_medio.valores,
                'Evasão (%)',
                '#D32F2F',
                '#FDEDEC',
                '%'
            );
        }

    } catch (error) {
        console.error("Erro ao carregar gráficos educacionais:", error);
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
                        label: function (context) {
                            const valor = context.raw;
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

function renderizarGraficoLinhasDuplas(canvasId, rotulos, dados1, dados2, label1, label2, cor1, cor2, sufixo = '') {
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
                    backgroundColor: `${cor1}1A`,
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
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}${sufixo}`;
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
