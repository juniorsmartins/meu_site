import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarConclusaoFundamental() {
    console.log(`[CONCLUSÃO FUNDAMENTAL ADAPTER] Iniciando sincronização via SIDRA (Tabela 4731)...`);

    try {
        // c582/59996 = Filtra EXATAMENTE "Ensino fundamental - Pessoas de 17 a 19 anos"
        const url = 'https://apisidra.ibge.gov.br/values/t/4731/n3/all/v/4721/p/all/c582/59996/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        const linhas = res.data.slice(1);
        
        const pares = linhas
            .map(linha => ({
                ano: linha['D3N'],
                valor: Number(linha['V'])
            }))
            .filter(p => p.ano && !isNaN(p.valor) && p.valor > 0)
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Nenhum dado válido encontrado.');
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

