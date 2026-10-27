import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_DESEMPREGO = 24369;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarDesemprego() {

    console.log(`[DESEMPREGO ADAPTER] Iniciando sincronização (BCB Série 24369)...`);

    try {
        const agora = new Date();
        
        const url = 'https://apisidra.ibge.gov.br/values/t/4562/n1/all/v/4099/p/all/h/y/f/a/d/m';
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data) || resposta.data.length <= 1) {
            console.warn("[DESEMPREGO ADAPTER] Falha ao obter dados de desemprego.");
            return { sucesso: false, slug: 'desemprego' };
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
                { slug: 'desemprego' },
                { 
                    titulo: 'Taxa Média de Desemprego (%)', 
                    fonte: 'IBGE (PNAD - Tabela 4562)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log("[DESEMPREGO ADAPTER] Desemprego sincronizado com sucesso!");
            return { sucesso: true, slug: 'desemprego' };
        }
        return { sucesso: false, slug: 'desemprego' };
    } catch (e) {
        console.error("[DESEMPREGO ADAPTER] Erro:", e.message);
        return { sucesso: false, slug: 'desemprego' };
    }
}

export { sincronizarDesemprego };

