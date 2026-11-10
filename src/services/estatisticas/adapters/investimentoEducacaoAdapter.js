import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR = 'SE.XPD.TOTL.GD.ZS';

async function sincronizarInvestimentoEducacao() {
    console.log(`[INVESTIMENTO EDUCAÇÃO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1995;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn('[INVESTIMENTO EDUCAÇÃO ADAPTER] Falha ao obter dados.');
            return { sucesso: false, slug: 'investimento_educacao' };
        }

        const dados = res.data[1];
        const anos = [];
        const valores = [];

        dados.forEach(item => {
            const ano = item.date;
            const valor = Number(item.value);
            if (ano && !isNaN(valor) && valor > 0) {
                anos.push(ano);
                valores.push(Number(valor.toFixed(2)));
            }
        });

        // Ordena cronologicamente
        const pares = anos.map((ano, i) => ({ ano, valor: valores[i] }))
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        await indicadorRepository.upsert('investimento_educacao', {
            titulo: 'Investimento Público em Educação (% do PIB)',
            fonte: 'World Bank Open Data (SE.XPD.TOTL.GD.ZS)',
            unidade: '%',
            anos: pares.map(p => p.ano),
            valores: pares.map(p => p.valor)
        });

        console.log(`[INVESTIMENTO EDUCAÇÃO ADAPTER] Sincronizado com sucesso! (${pares.length} anos)`);
        return { sucesso: true, slug: 'investimento_educacao' };

    } catch (e) {
        console.error('[INVESTIMENTO EDUCAÇÃO ADAPTER] Erro crítico: ', e.message);
        return { sucesso: false, slug: 'investimento_educacao' };
    }
}

export { 
    sincronizarInvestimentoEducacao 
};

