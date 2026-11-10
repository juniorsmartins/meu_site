import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // Variável 9608 = Total de docentes
        // Variável 9609 = Docentes com formação adequada
        const baseUrl = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all';
        const params = '/p/all/c2/all/c813/all/f/a';

        const urlTotal = `${baseUrl}/v/9608${params}`;
        const urlAdequada = `${baseUrl}/v/9609${params}`;

        const [resTotal, resAdequada] = await Promise.all([
            httpClient(urlTotal),
            httpClient(urlAdequada)
        ]);

        if (!resTotal.ok || !resAdequada.ok || !Array.isArray(resTotal.data) || !Array.isArray(resAdequada.data)) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        // Função auxiliar para extrair o total por ano (ignorando sexo e etapa)
        // A API retorna múltiplas linhas por ano. Precisamos pegar a linha onde Sexo = "Total" e Etapa = "Total".
        const extrairTotaisPorAno = (dados) => {
            const linhas = dados.slice(1);
            const mapa = {};
            linhas.forEach(linha => {
                const sexo = String(linha['D4N'] || '').trim().toLowerCase();
                const etapa = String(linha['D5N'] || '').trim().toLowerCase();
                // Filtra apenas a linha que representa o total geral
                if (sexo === 'total' && etapa === 'total') {
                    const ano = linha['D3N'];
                    const valor = Number(linha['V']);
                    if (ano && !isNaN(valor)) {
                        mapa[ano] = valor;
                    }
                }
            });
            return mapa;
        };

        const totais = extrairTotaisPorAno(resTotal.data);
        const adequados = extrairTotaisPorAno(resAdequada.data);

        const pares = [];
        Object.keys(totais).forEach(ano => {
            const total = totais[ano];
            const adequado = adequados[ano];
            // Calcula a proporção se ambos os valores existirem e o total for maior que zero
            if (total > 0 && adequado !== undefined) {
                const proporcao = (adequado / total) * 100;
                pares.push({ ano, valor: Number(proporcao.toFixed(2)) });
            }
        });

        pares.sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Nenhum dado válido calculado.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        await indicadorRepository.upsert('docentes_superior', {
            titulo: '% de Docentes com Ensino Superior',
            fonte: 'IBGE - PNAD Contínua / SIDRA (Tabela 6676) - Cálculo próprio',
            unidade: '%',
            anos: pares.map(p => p.ano),
            valores: pares.map(p => p.valor)
        });

        console.log(`[DOCENTES SUPERIOR ADAPTER] Sincronizado com sucesso! (${pares.length} anos)`);
        return { sucesso: true, slug: 'docentes_superior' };

    } catch (e) {
        console.error('[DOCENTES SUPERIOR ADAPTER] Erro crítico: ', e.message);
        return { sucesso: false, slug: 'docentes_superior' };
    }
}

export { 
    sincronizarDocentesSuperior 
};

