import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_VAREJO = 1453;

async function sincronizarVendasVarejo() {
    
    console.log(`[VAREJO ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_VAREJO}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'vendas_varejo' };
        }

        const dadosPorAno = {};
        res.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, , ano] = item.data.split('/');
                const valor = Number(item.valor);
                if (!isNaN(valor)) {
                    if (!dadosPorAno[ano]) dadosPorAno[ano] = [];
                    dadosPorAno[ano].push(valor);
                }
            }
        });

        const mapaAnual = {};
        Object.keys(dadosPorAno).forEach(ano => {
            const variacoesMensais = dadosPorAno[ano];
            let fatorAcumulado = 1;
            variacoesMensais.forEach(variacao => {
                fatorAcumulado *= (1 + (variacao / 100));
            });
            mapaAnual[ano] = Number(((fatorAcumulado - 1) * 100).toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'vendas_varejo' },
            {
                titulo: 'Vendas no Varejo (%)',
                fonte: 'Banco Central do Brasil (Série 1453)',
                unidade: '%',
                anos, 
                valores, 
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[VAREJO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'vendas_varejo' };

    } catch (e) {
        console.error("[VAREJO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'vendas_varejo' };
    }
}

export { 
    sincronizarVendasVarejo 
};

