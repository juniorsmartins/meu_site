import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // v/9607 = Percentual de docentes com formação adequada (%)
        // c1205/0 = Total (Sexo)
        // c1206/0 = Total (Etapa de ensino)
        const url = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all/v/9607/p/all/c1205/0/c1206/0/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        const cabecalho = res.data[0];
        const linhas = res.data.slice(1);

        // Usa Object.keys para achar o índice exato, evitando conflitos com strings parecidas
        const idxAno = Object.keys(cabecalho).findIndex(k => k === 'D3N');
        const idxValor = Object.keys(cabecalho).findIndex(k => k === 'V');

        const pares = linhas
            .map(linha => ({
                ano: linha[idxAno],
                valor: Number(linha[idxValor])
            }))
            // Filtra nulos, textos e valores inválidos
            .filter(p => p.ano && !isNaN(p.valor) && p.valor > 0)
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

