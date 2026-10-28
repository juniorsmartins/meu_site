import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_META_SELIC = 432;

async function sincronizarSelic() {
    
    console.log(`[SELIC ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1; 

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_META_SELIC}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'selic' };
        }

        const entradas = res.data
            .filter(item => item.data && item.data.includes('/'))
            .map(item => {
                const [dia, mes, ano] = item.data.split('/').map(Number);
                return { data: new Date(ano, mes - 1, dia), valor: Number(item.valor) };
            })
            .filter(e => !isNaN(e.valor))
            .sort((a, b) => a.data - b.data);

        const acumuladoAnual = {}; 

        for (let i = 0; i < entradas.length; i++) {
            const atual = entradas[i];
            const proxima = entradas[i + 1];

            const inicio = (i === 0) ? new Date(atual.data.getFullYear(), 0, 1) : atual.data;
            const fim = proxima ? proxima.data : new Date(atual.data.getFullYear() + 1, 0, 1);

            let cursor = new Date(inicio);
            while (cursor < fim) {
                const ano = cursor.getFullYear();
                const fimDoAno = new Date(ano + 1, 0, 1);
                const fimBloco = fim < fimDoAno ? fim : fimDoAno;
                const dias = Math.round((fimBloco - cursor) / 86400000);

                if (!acumuladoAnual[ano]) acumuladoAnual[ano] = { somaPonderada: 0, diasTotais: 0 };
                acumuladoAnual[ano].somaPonderada += dias * atual.valor;
                acumuladoAnual[ano].diasTotais += dias;

                cursor = fimBloco;
            }
        }

        const mapaAnual = {};
        Object.keys(acumuladoAnual).forEach(ano => {
            const { somaPonderada, diasTotais } = acumuladoAnual[ano];
            if (diasTotais > 0) {
                mapaAnual[ano] = Math.round((somaPonderada / diasTotais) * 100) / 100;
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'selic' },
            {
                titulo: 'Taxa Básica de Juros - Selic - Média Anual (% a.a.)',
                fonte: 'Banco Central (Meta Selic - Copom)',
                unidade: '%',
                anos, 
                valores, 
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[SELIC ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'selic' };

    } catch (e) {
        console.error("[SELIC ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'selic' };
    }
}

export { 
    sincronizarSelic 
};

