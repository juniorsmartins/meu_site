import { API_URL_ESTATISTICAS } from '../constantsConfig.js';

// Registra o plugin de datalabels (usado apenas no gráfico de dispersão do PISA)
// e desativa por padrão em todos os gráficos.
if (window.ChartDataLabels) {
    Chart.register(window.ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', { display: false });
}

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const resposta = await fetch(API_URL_ESTATISTICAS);
        if (!resposta.ok) throw new Error("Erro ao buscar estatísticas educacionais.");

        const resultado = await resposta.json();
        const dados = resultado.dados || {};

        // -----------------------------------------------------------------
        // SEÇÃO 1 — QUALIDADE E APRENDIZADO
        // -----------------------------------------------------------------

        // 1. IDEB — Anos Iniciais vs Anos Finais
        if (dados.ideb && dados.ideb.anos && dados.ideb.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoIdeb',
                dados.ideb.anos,
                dados.ideb.anos_iniciais || [],
                dados.ideb.anos_finais || [],
                'Anos Iniciais',
                'Anos Finais',
                '#1565C0',
                '#2E7D32',
                ''
            );
        }

        // 2. IDEB — Ensino Médio
        if (dados.ideb_medio && dados.ideb_medio.anos && dados.ideb_medio.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoIdebMedio',
                dados.ideb_medio.anos,
                dados.ideb_medio.valores,
                'IDEB — Ensino Médio',
                '#6A1B9A',
                '#F3E5F5',
                ''
            );
        }

        // 3. Proficiência SAEB
        if (dados.proficiencia_saeb && dados.proficiencia_saeb.anos && dados.proficiencia_saeb.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoProficienciaSaeb',
                dados.proficiencia_saeb.anos,
                dados.proficiencia_saeb.portugues || [],
                dados.proficiencia_saeb.matematica || [],
                'Português',
                'Matemática',
                '#1565C0',
                '#E65100',
                ' pts'
            );
        }

        // 4. % Insuficiente SAEB
        if (dados.insuficiente_saeb && dados.insuficiente_saeb.anos && dados.insuficiente_saeb.anos.length > 0) {
            renderizarGraficoLinhasDuplas(
                'graficoInsuficienteSaeb',
                dados.insuficiente_saeb.anos,
                dados.insuficiente_saeb.portugues || [],
                dados.insuficiente_saeb.matematica || [],
                'Português',
                'Matemática',
                '#C62828',
                '#E65100',
                '%'
            );
        }

        // -----------------------------------------------------------------
        // SEÇÃO 2 — FLUXO ESCOLAR
        // -----------------------------------------------------------------

        // 5. Frequência Líquida
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

        // 6. Aprovação Fundamental
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

        // 7. Conclusão Fundamental
        if (dados.conclusao_fundamental && dados.conclusao_fundamental.anos && dados.conclusao_fundamental.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoConclusaoFundamental',
                dados.conclusao_fundamental.anos,
                dados.conclusao_fundamental.valores,
                'Conclusão do Fundamental (%)',
                '#00838F',
                '#E0F7FA',
                '%'
            );
        }

        // 8. Conclusão Médio
        if (dados.conclusao_medio && dados.conclusao_medio.anos && dados.conclusao_medio.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoConclusaoMedio',
                dados.conclusao_medio.anos,
                dados.conclusao_medio.valores,
                'Conclusão do Médio (%)',
                '#6A1B9A',
                '#F3E5F5',
                '%'
            );
        }

        // 9. Evasão Médio (destaque)
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

        // -----------------------------------------------------------------
        // SEÇÃO 3 — CONTEXTO E FINANCIAMENTO
        // -----------------------------------------------------------------

        // 10. Analfabetismo
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

        // 11. Anos de Estudo
        if (dados.anos_estudo && dados.anos_estudo.anos && dados.anos_estudo.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoAnosEstudo',
                dados.anos_estudo.anos,
                dados.anos_estudo.valores,
                'Anos de Estudo',
                '#1565C0',
                '#E3F2FD',
                ' anos'
            );
        }

        // 12. Docentes com Superior
        if (dados.docentes_superior && dados.docentes_superior.anos && dados.docentes_superior.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoDocentesSuperior',
                dados.docentes_superior.anos,
                dados.docentes_superior.valores,
                'Docentes com Superior (%)',
                '#00897B',
                '#E0F2F1',
                '%'
            );
        }

        // 13. Investimento % PIB
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

        // 14. Investimento por Aluno (destaque)
        if (dados.investimento_aluno && dados.investimento_aluno.anos && dados.investimento_aluno.anos.length > 0) {
            renderizarGraficoLinha(
                'graficoInvestimentoAluno',
                dados.investimento_aluno.anos,
                dados.investimento_aluno.valores,
                'Investimento por Aluno (R$)',
                '#F57C00',
                '#FFF3E0',
                'R$ '
            );
        }

        // -----------------------------------------------------------------
        // SEÇÃO 4 — COMPARAÇÃO INTERNACIONAL
        // -----------------------------------------------------------------

        // 15. PISA — Brasil (3 linhas)
        if (dados.pisa && dados.pisa.anos && dados.pisa.anos.length > 0) {
            renderizarGraficoLinhasTriplas(
                'graficoPisa',
                dados.pisa.anos,
                dados.pisa.leitura || [],
                dados.pisa.matematica || [],
                dados.pisa.ciencias || [],
                'Leitura',
                'Matemática',
                'Ciências',
                ['#1565C0', '#E65100', '#2E7D32'],
                ' pts'
            );
        }

        // 16. PISA vs Gasto por Aluno (dispersão)
        if (dados.pisa_gasto_desempenho && dados.pisa_gasto_desempenho.paises && dados.pisa_gasto_desempenho.paises.length > 0) {
            renderizarGraficoScatter(
                'graficoPisaGasto',
                dados.pisa_gasto_desempenho.paises,
                dados.pisa_gasto_desempenho.gasto,
                dados.pisa_gasto_desempenho.desempenho,
                dados.pisa_gasto_desempenho.destaque || 'Brasil'
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
                        label: (context) => {
                            const valor = context.raw;
                            if (valor === null || valor === undefined) return 'Sem dados';
                            if (prefixo === 'R$ ') return `R$ ${valor.toLocaleString('pt-BR')}`;
                            return `${prefixo}${valor.toString().replace('.', ',')}`;
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
                        label: (context) => `${context.dataset.label}: ${context.raw}${sufixo}`
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

function renderizarGraficoLinhasTriplas(canvasId, rotulos, dados1, dados2, dados3, label1, label2, label3, cores, sufixo = '') {
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
                    borderColor: cores[0],
                    backgroundColor: `${cores[0]}1A`,
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: label2,
                    data: dados2,
                    borderColor: cores[1],
                    backgroundColor: `${cores[1]}1A`,
                    borderWidth: 2.5,
                    tension: 0.3,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: label3,
                    data: dados3,
                    borderColor: cores[2],
                    backgroundColor: `${cores[2]}1A`,
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
                        label: (context) => `${context.dataset.label}: ${context.raw}${sufixo}`
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

function renderizarGraficoScatter(canvasId, paises, gastos, desempenhos, destaque) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const pontos = paises.map((pais, i) => ({
        x: gastos[i],
        y: desempenhos[i],
        pais: pais
    }));

    const cores = paises.map(p => p === destaque ? '#C62828' : 'rgba(21, 101, 192, 0.65)');
    const bordas = paises.map(p => p === destaque ? '#8E0000' : 'rgba(21, 101, 192, 0.9)');
    const raios = paises.map(p => p === destaque ? 9 : 6);

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Países',
                data: pontos,
                backgroundColor: cores,
                borderColor: bordas,
                borderWidth: 1.5,
                pointRadius: raios,
                pointHoverRadius: raios.map(r => r + 2)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const p = ctx.raw;
                            return `${p.pais}: US$ ${p.x.toFixed(1)} mil / ${p.y} pts`;
                        }
                    }
                },
                datalabels: {
                    display: window.ChartDataLabels ? 'auto' : false,
                    align: 'top',
                    offset: 4,
                    font: { size: 9, weight: '600' },
                    color: '#333',
                    formatter: (value, ctx) => {
                        const p = ctx.dataset.data[ctx.dataIndex];
                        return p ? p.pais : '';
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Gasto por aluno (US$ PPP, mil)' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                y: {
                    title: { display: true, text: 'Nota média PISA' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                }
            }
        }
    });
}

