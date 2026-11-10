import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // v/9609 = Proporção de docentes com formação adequada (%)
        // c2/all = todas as categorias de Sexo
        // c813/all = todas as categorias de Etapa de ensino
        const url = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all/v/9609/p/all/c2/all/c813/all/f/a';
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        const linhas = res.data.slice(1);
        const pares = [];

        // A API não tem uma categoria "Total" explícita, então filtramos pelo texto
        // ou pegamos a primeira ocorrência de cada ano (que costuma ser o total).
        // Para garantir, vamos buscar as linhas onde a Etapa de ensino é "Total" e Sexo é "Total".
        const linhasTotais = linhas.filter(linha => {
            const sexo = String(linha['D4N'] || '').trim().toLowerCase();
            const etapa = String(linha['D5N'] || '').trim().toLowerCase();
            return sexo === 'total' && etapa === 'total';
        });

        // Se a API não retornar linhas "Total" (dependendo da versão), pegamos a primeira linha de cada ano
        const dadosParaProcessar = linhasTotais.length > 0 ? linhasTotais : linhas;

        dadosParaProcessar.forEach(linha => {
            const ano = linha['D3N'];
            const valor = Number(linha['V']);

            if (ano && !isNaN(valor) && valor > 0) {
                // Evita duplicatas do mesmo ano (caso a API retorne várias categorias)
                if (!pares.some(p => p.ano === ano)) {
                    pares.push({ ano, valor });
                }
            }
        });

        pares.sort((a, b) => Number(a.ano) - Number(b.ano));

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

