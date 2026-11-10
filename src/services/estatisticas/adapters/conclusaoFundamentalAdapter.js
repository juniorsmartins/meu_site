import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarConclusaoFundamental() {
    console.log(`[CONCLUSÃO FUNDAMENTAL ADAPTER] Iniciando sincronização via SIDRA (Tabela 4731)...`);

    try {
        const url = 'https://apisidra.ibge.gov.br/values/t/4731/n3/all/v/4721/p/all/c582/all/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        const cabecalho = res.data[0];
        const linhas = res.data.slice(1);

        const idxValor = Object.keys(cabecalho).findIndex(k => k === 'V');
        const idxAno = Object.keys(cabecalho).findIndex(k => k === 'D3N');
        const idxCategoria = Object.keys(cabecalho).findIndex(k => k === 'D4N');

        // Log para diagnóstico: quantas linhas vieram e quais categorias existem
        console.log(`[CONCLUSÃO] Total de linhas: ${linhas.length}`);
        const categoriasUnicas = [...new Set(linhas.map(l => l[idxCategoria]))];
        console.log('[CONCLUSÃO] Categorias disponíveis:', categoriasUnicas);

        const pares = linhas
            .filter(linha => {
                const cat = String(linha[idxCategoria] || '').toLowerCase();
                return cat.includes('ensino fundamental') && cat.includes('17 a 19');
            })
            .map(linha => ({
                ano: linha[idxAno],
                valor: Number(linha[idxValor])
            }))
            .filter(p => p.ano && !isNaN(p.valor) && p.valor > 0)
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Nenhum dado válido após filtro.');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        await indicadorRepository.upsert('conclusao_fundamental', {
            titulo: 'Taxa de Conclusão — Ensino Fundamental (17–19 anos)',
            fonte: 'IBGE - PNAD Contínua / SIDRA (Tabela 4731)',
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

