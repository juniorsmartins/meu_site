import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

async function sincronizarDocentesSuperior() {
    console.log(`[DOCENTES SUPERIOR ADAPTER] Iniciando sincronização via SIDRA (Tabela 6676)...`);

    try {
        // É OBRIGATÓRIO incluir c2/all (Sexo) e c813/all (Etapa de Ensino).
        // Sem isso, a API retorna ".." porque não sabe como agregar os dados.
        const urlAdequados = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all/v/9609/p/all/c2/all/c813/all/f/a';
        const urlTotal = 'https://apisidra.ibge.gov.br/values/t/6676/n3/all/v/9608/p/all/c2/all/c813/all/f/a';

        const [resAdequados, resTotal] = await Promise.all([
            httpClient(urlAdequados),
            httpClient(urlTotal)
        ]);

        if (!resAdequados.ok || !resTotal.ok || !Array.isArray(resAdequados.data) || !Array.isArray(resTotal.data)) {
            console.warn('[DOCENTES SUPERIOR ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'docentes_superior' };
        }

        // Função que extrai apenas a linha "Total" de cada estado e soma para obter o Brasil
        const extrairTotaisPorAno = (dados) => {
            const mapa = {};
            const linhas = dados.slice(1); // Pula o cabeçalho
            linhas.forEach(linha => {
                const sexo = String(linha['D4N'] || '').trim().toLowerCase();
                const etapa = String(linha['D5N'] || '').trim().toLowerCase();
                
                // O SIDRA pode retornar "total" ou uma string vazia "" para a categoria agregada
                const isTotal = (str) => str === 'total' || str === '';

                if (isTotal(sexo) && isTotal(etapa)) {
                    const ano = linha['D3N'];
                    const valor = Number(linha['V']);
                    
                    // Soma os valores de todos os estados para obter o total do Brasil no ano
                    if (ano && !isNaN(valor)) {
                        mapa[ano] = (mapa[ano] || 0) + valor;
                    }
                }
            });
            return mapa;
        };

        const adequadosMap = extrairTotaisPorAno(resAdequados.data);
        const totalMap = extrairTotaisPorAno(resTotal.data);

        const pares = [];
        Object.keys(totalMap).forEach(ano => {
            const total = totalMap[ano];
            const adequados = adequadosMap[ano];

            // Calcula a proporção apenas se ambos os valores existirem
            if (total > 0 && adequados !== undefined) {
                const proporcao = (adequados / total) * 100;
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

