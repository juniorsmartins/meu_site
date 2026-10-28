import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_META_SELIC = 432;

async function sincronizarSelic() {
    
    console.log(`[SELIC ADAPTER] Iniciando sincronização (Série 432 - Diária)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1; 

        // A API do BCB limita séries diárias a 10 anos por consulta.
        // Vamos fatiar em blocos de 10 anos.
        const dadosCompletos = [];

        for (let ano = anoInicio; ano <= anoFim; ano += 10) {
            const fimBloco = Math.min(ano + 9, anoFim);
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_META_SELIC}/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=31/12/${fimBloco}`;
            
            console.log(`[SELIC ADAPTER] Buscando bloco ${ano}-${fimBloco}...`);
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data)) {
                dadosCompletos.push(...res.data);
            } else {
                console.warn(`[SELIC ADAPTER] Falha no bloco ${ano}-${fimBloco}`);
            }
        }

        if (dadosCompletos.length === 0) {
            return { sucesso: false, slug: 'selic' };
        }

        // ---------------------------------------------------------------
        // 1. Normaliza e ordena as entradas por data
        // ---------------------------------------------------------------
        const entradas = dadosCompletos
            .filter(item => item.data && item.data.includes('/'))
            .map(item => {
                const [dia, mes, ano] = item.data.split('/').map(Number);
                return {
                    data: new Date(ano, mes - 1, dia),
                    valor: Number(item.valor)
                };
            })
            .filter(e => !isNaN(e.valor))
            .sort((a, b) => a.data - b.data);

        // ---------------------------------------------------------------
        // 2. Média ponderada pelo tempo, distribuindo os dias de vigência
        //    de cada meta entre os anos que ela abrange
        // ---------------------------------------------------------------
        const acumuladoAnual = {}; // ano -> { somaPonderada, diasTotais }

        for (let i = 0; i < entradas.length; i++) {
            const atual = entradas[i];
            const proxima = entradas[i + 1];

            // Primeira entrada: assume vigência desde 1º/jan do ano dela
            const inicio = (i === 0)
                ? new Date(atual.data.getFullYear(), 0, 1)
                : atual.data;

            // Última entrada: assume vigência até o fim do ano dela
            const fim = proxima
                ? proxima.data
                : new Date(atual.data.getFullYear() + 1, 0, 1);

            // Distribui os dias do período entre os anos que ele atravessa
            let cursor = new Date(inicio);
            while (cursor < fim) {
                const ano = cursor.getFullYear();
                const fimDoAno = new Date(ano + 1, 0, 1);
                const fimBloco = fim < fimDoAno ? fim : fimDoAno;
                const dias = Math.round((fimBloco - cursor) / 86400000);

                if (!acumuladoAnual[ano]) {
                    acumuladoAnual[ano] = { somaPonderada: 0, diasTotais: 0 };
                }
                acumuladoAnual[ano].somaPonderada += dias * atual.valor;
                acumuladoAnual[ano].diasTotais += dias;

                cursor = fimBloco;
            }
        }

        // ---------------------------------------------------------------
        // 3. Fecha a média por ano (arredondada a 2 casas)
        // ---------------------------------------------------------------
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
                fonte: 'Banco Central (Meta Selic - Copom, média ponderada pelo tempo)',
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

