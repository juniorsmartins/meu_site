import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_SELIC = 432;

async function sincronizarSelic(dataInicioStr, dataFimStr, agora) {
    try {
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data)) {
            console.warn("[SELIC ADAPTER] Falha ao obter dados da Selic.");
            return { sucesso: false, slug: 'selic' };
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
                { slug: 'selic' },
                { 
                    titulo: 'Taxa Básica de Juros - Selic (%)', 
                    fonte: 'Banco Central (Série 432)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log("[SELIC ADAPTER] Selic sincronizada com sucesso!");
            return { sucesso: true, slug: 'selic' };
        }
        return { sucesso: false, slug: 'selic' };
    } catch (e) {
        console.error("[SELIC ADAPTER] Erro:", e.message);
        return { sucesso: false, slug: 'selic' };
    }
}

export { sincronizarSelic };

