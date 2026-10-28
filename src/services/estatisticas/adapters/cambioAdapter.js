import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_CAMBIO = 3695; // Taxa de câmbio comercial para venda (R$/US$)

async function sincronizarCambio() {
    
    console.log(`[CÂMBIO ADAPTER] Iniciando sincronização (Série 3695)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_CAMBIO}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'cambio' };
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
            const valoresDiarios = dadosPorAno[ano];
            const soma = valoresDiarios.reduce((acc, val) => acc + val, 0);
            mapaAnual[ano] = Number((soma / valoresDiarios.length).toFixed(4));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'cambio' },
            {
                titulo: 'Taxa de Câmbio Média Anual (R$/US$)',
                fonte: 'Banco Central do Brasil (Série 3695)',
                unidade: 'R$',
                anos, 
                valores, 
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[CÂMBIO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'cambio' };

    } catch (e) {
        console.error("[CÂMBIO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'cambio' };
    }
}

export { 
    sincronizarCambio 
};

