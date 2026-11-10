import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarConclusaoFundamental() {
    console.log(`[CONCLUSÃO FUNDAMENTAL ADAPTER] Iniciando sincronização via SIDRA (Tabela 4731)...`);

    try {
        // v/all = todas as variáveis; depois filtramos a de "Ensino fundamental"
        // n3/all = Brasil
        const url = 'https://apisidra.ibge.gov.br/values/t/4731/n3/all/v/all/p/all/h/y/f/a/d/m';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'conclusao_fundamental' };
        }

        const cabecalho = res.data[0];
        const linhas = res.data.slice(1);

        const idxAno = Object.values(cabecalho).findIndex(v => v === 'Ano');
        const idxValor = Object.values(cabecalho).findIndex(v => v === 'Valor');
        const idxVariavel = Object.values(cabecalho).findIndex(v => v === 'Variável');

        // Filtra apenas a variável que corresponde ao Ensino Fundamental
        const pares = linhas
            .filter(linha => {
                const nomeVariavel = String(linha[idxVariavel] || '').toLowerCase();
                return nomeVariavel.includes('ensino fundamental') && nomeVariavel.includes('17');
            })
            .map(linha => ({
                ano: linha[idxAno],
                valor: Number(linha[idxValor])
            }))
            .filter(p => p.ano && !isNaN(p.valor))
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[CONCLUSÃO FUNDAMENTAL ADAPTER] Nenhum dado válido (verifique os filtros de variável).');
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

