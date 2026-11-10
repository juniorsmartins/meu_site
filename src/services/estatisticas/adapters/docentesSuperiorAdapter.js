import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // n1/all = Brasil
        // v/9610 = Proporção de docentes com formação adequada (já vem em %)
        const url = 'https://apisidra.ibge.gov.br/values/t/6676/n1/all/v/9610/p/all/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        const linhas = res.data.slice(1);
        
        // Na tabela 6676 usando n1, o ano fica na coluna D2N
        const pares = linhas
            .map(linha => ({
                ano: linha['D2N'],
                valor: Number(linha['V'])
            }))
            .filter(p => p.ano && !isNaN(p.valor) && p.valor > 0)
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Nenhum dado válido encontrado.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        await indicadorRepository.upsert('docentes_superior', {
            titulo: '% de Docentes com Ensino Superior',
            fonte: 'IBGE - PNAD Contínua / SIDRA (Tabela 6676)',
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

