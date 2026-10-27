import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

async function sincronizarPib() {

    console.log(`[PIB ADAPTER] Iniciando sincronização do PIB...`);

    try {
        const agora = new Date();

        const url = `https://apisidra.ibge.gov.br/values/t/6784/n1/all/v/9810/p/all/h/y/f/a/d/m`;

        console.log(`[PIB ADAPTER] Buscando dados no IBGE SIDRA...`);
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data) || resposta.data.length <= 1) {
            console.warn("[PIB ADAPTER] Falha ao obter dados do PIB no SIDRA.");
            return { sucesso: false, slug: 'pib' };
        }

        const dados = resposta.data.slice(1);
        const pares = dados.map(item => {
            const ano = item.D3N;
            const valorNumerico = Number(item.V);
            const valor = Number.isFinite(valorNumerico) ? valorNumerico : null;
            
            return { ano, valor };
        })
        .filter(item => item.ano !== null); 

        pares.sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn("[PIB ADAPTER] Nenhum dado válido do PIB foi encontrado após o filtro.");
            return { sucesso: false, slug: 'pib' };
        }

        const anos = pares.map(item => item.ano);
        const valores = pares.map(item => item.valor);

        // ---------------------------------------------------------------
        // Salva no MongoDB
        // ---------------------------------------------------------------
        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'pib' },
            { 
                titulo: 'Crescimento do PIB Anual (%)', 
                fonte: 'IBGE (SIDRA - Tabela 6784)', 
                unidade: '%', 
                anos, 
                valores, 
                ultimaAtualizacao: agora 
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[PIB ADAPTER] PIB sincronizado com sucesso! (${anos.length} anos carregados, sendo ${valores.filter(v => v === null).length} sem dados)`);
        return { sucesso: true, slug: 'pib' };

    } catch (e) {
        console.error("[PIB ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'pib' };
    }
}

export { 
    sincronizarPib 
};

