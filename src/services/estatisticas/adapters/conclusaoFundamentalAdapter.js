import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarConclusaoFundamental() {
    console.log(`[CONCLUSÃO FUNDAMENTAL ADAPTER] Iniciando sincronização via SIDRA (Tabela 4731)...`);

    try {
        // v/4722 = Taxa de conclusão de nível de ensino
        // c582/all = todas as categorias de "Grupos de idade e nível de ensino"
        // f/a = formato JSON com cabeçalho na primeira linha
        const url = 'https://apisidra.ibge.gov.br/values/t/4731/n3/all/v/4722/p/all/c582/all/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        const cabecalho = res.data[0];
        const linhas = res.data.slice(1);

        // Mapeia dinamicamente os índices das colunas de interesse
        const idxValor = Object.values(cabecalho).findIndex(v => v === 'Valor');
        const idxAno = Object.values(cabecalho).findIndex(v => v === 'Ano');
        
        // AQUI ESTAVA O ERRO: A categoria está na coluna D4N, não na D3N (Variável)
        const idxCategoria = Object.values(cabecalho).findIndex(v => v === 'Grupos de idade e nível de ensino');

        // Filtra pela categoria exata "Ensino fundamental - Pessoas de 17 a 19 anos"
        const pares = linhas
            .filter(linha => {
                const nomeCategoria = String(linha[idxCategoria] || '').toLowerCase();
                return nomeCategoria.includes('ensino fundamental') && nomeCategoria.includes('17 a 19');
            })
            .map(linha => ({
                ano: linha[idxAno],
                valor: Number(linha[idxValor])
            }))
            .filter(p => p.ano && !isNaN(p.valor) && p.valor > 0)
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Nenhum dado válido (verifique os filtros de categoria).');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        await indicadorRepository.upsert('conclusao_fundamental', {
            titulo: 'Taxa de Conclusão — Ensino Fundamental (17–19 anos)',
            fonte: 'IBGE - PNAD Contínua / SIDRA (Tabela 4731, variável 4722)',
            unidade: '%',
            anos: pares.map(p => p.ano),
            valores: pares.map(p => p.valor)
        });

        console.log(`[CONCLUSÃO FUNDAMENTAL ADAPTER] Sincronizado com sucesso! (${pares.length} anos)`);
        return { sucesso: true, slug: 'conclusao_fundamental' };

    } catch (e) {
        console.error('[CONCLUSÃO FUNDAMENTAL ADAPTER] Erro crítico: ', e.message);
        return { sucesso: false, slug: 'conclusao_fundamental' };
    }
}

export { 
    sincronizarConclusaoFundamental 
};

