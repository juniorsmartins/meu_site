import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_IPCA = 433;

async function sincronizarIpca(dataInicioStr, dataFimStr, agora) {
    try {
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data)) {
            console.warn("[IPCA ADAPTER] Falha ao obter dados do IPCA.");
            return { sucesso: false, slug: 'ipca' };
        }

        const mapaAnual = {};
        resposta.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const partes = item.data.split('/');
                const ano = partes[2];
                const mes = partes[1];
                if (mes === '12' || !mapaAnual[ano]) {
                    mapaAnual[ano] = Number(item.valor);
                }
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => a - b);
        const valores = anos.map(ano => mapaAnual[ano]);

        if (anos.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'ipca' },
                { 
                    titulo: 'Inflação Oficial - IPCA (%)', 
                    fonte: 'Banco Central / IBGE (Série 433)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log("[IPCA ADAPTER] IPCA sincronizado com sucesso!");
            return { sucesso: true, slug: 'ipca' };
        }
        return { sucesso: false, slug: 'ipca' };
    } catch (e) {
        console.error("[IPCA ADAPTER] Erro: ", e.message);
        return { sucesso: false, slug: 'ipca' };
    }
}

export { sincronizarIpca };

