import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // v/9609 = proporção de docentes com formação adequada
        // n3/all = Brasil (nível 3)
        // p/all = todos os períodos disponíveis
        const url = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all/v/9609/p/all/h/y/f/a/d/m';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        const cabecalho = res.data[0];
        const linhas = res.data.slice(1);

        // Identifica os índices das colunas de ano e valor no cabeçalho
        const idxAno = Object.values(cabecalho).findIndex(v => v === 'Ano');
        const idxValor = Object.values(cabecalho).findIndex(v => v === 'Valor');

        const pares = linhas
            .map(linha => ({
                ano: linha[idxAno],
                valor: Number(linha[idxValor])
            }))
            .filter(p => p.ano && !isNaN(p.valor))
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Nenhum dado válido.');
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

