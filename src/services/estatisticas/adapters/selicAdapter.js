import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

// Código 4390 = Taxa Selic mensal do Banco Central
const SERIE_BCB_SELIC_MENSAL = 4390;

async function sincronizarSelic(dataInicioStr, dataFimStr, agora) {

    try {

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC_MENSAL}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data)) {
            console.warn("[SELIC ADAPTER] Falha ao obter dados mensais da Selic.");
            return { sucesso: false, slug: 'selic' };
        }

        const acumuladorAnual = {};

        // Itera sobre os dados mensais para acumular os valores e contar os meses por ano
        resposta.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const partes = item.data.split('/');
                const ano = partes[2];
                const valorNumerico = Number(item.valor);
                
                if (!isNaN(valorNumerico)) {
                    if (!acumuladorAnual[ano]) {
                        acumuladorAnual[ano] = { soma: 0, count: 0 };
                    }
                    acumuladorAnual[ano].soma += valorNumerico;
                    acumuladorAnual[ano].count += 1;
                }
            }
        });

        const anos = Object.keys(acumuladorAnual).sort((a, b) => Number(a) - Number(b));
        
        // Calcula a média aritmética dos meses para cada ano (ou ajuste se preferir o último mês)
        const valores = anos.map(ano => {
            const { soma, count } = acumuladorAnual[ano];
            const media = soma / count;
            return Number(media.toFixed(2)); // Arredonda para 2 casas decimais
        });

        if (anos.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'selic' },
                { 
                    titulo: 'Taxa Média da Selic (% ao mês / média anual)', 
                    fonte: 'Banco Central (Série 4390)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log("[SELIC ADAPTER] Selic anual calculada via média mensal com sucesso!");
            return { sucesso: true, slug: 'selic' };
        }

        return { sucesso: false, slug: 'selic' };
    } catch (e) {
        console.error("[SELIC ADAPTER] Erro crítico:", e.message);
        return { sucesso: false, slug: 'selic' };
    }
}

export { 
    sincronizarSelic 
};

