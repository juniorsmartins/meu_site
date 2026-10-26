import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

async function sincronizarPib(agora) {
    try {
        const url = `https://apisidra.ibge.gov.br/values/t/6784/n1/all/v/9810/p/all/h/y/f/a/d/m`;
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data) || resposta.data.length <= 1) {
            console.warn("[PIB ADAPTER] Falha ao obter dados do PIB.");
            return { sucesso: false, slug: 'pib' };
        }

        const dados = resposta.data.slice(1);
        const pares = dados.map(item => {
            const ano = item.D3N;
            const valor = Number(item.V);
            return { ano, valor: Number.isFinite(valor) ? valor : null };
        }).filter(item => item.ano && item.valor !== null);

        pares.sort((a, b) => Number(a.ano) - Number(b.ano));
        const anos = pares.map(item => item.ano);
        const valores = pares.map(item => item.valor);

        if (anos.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'pib' },
                { 
                    titulo: 'Crescimento do PIB (%)', 
                    fonte: 'IBGE (SIDRA - Tabela 6784)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log("[PIB ADAPTER] PIB sincronizado com sucesso!");
            return { sucesso: true, slug: 'pib' };
        }
        return { sucesso: false, slug: 'pib' };
    } catch (e) {
        console.error("[PIB ADAPTER] Erro:", e.message);
        return { sucesso: false, slug: 'pib' };
    }
}

export { sincronizarPib };

