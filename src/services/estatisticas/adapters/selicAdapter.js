import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

// Código 432 = Taxa de juros - Meta Selic definida pelo Copom
const SERIE_BCB_META_SELIC = 432;

async function sincronizarSelic(dataInicioStr, dataFimStr, agora) {
    try {
        const anoAtual = new Date().getFullYear();
        const anoFim = anoAtual - 1;       // 2025
        const anoInicio = anoFim - 19;     // 2006 (Total de 20 anos)

        console.log(`[SELIC ADAPTER] Buscando Meta Selic histórica de 20 anos (${anoInicio} a ${anoFim}) em blocos de 5 anos...`);

        // Divide os 20 anos em 4 blocos de 5 anos para evitar timeout na API do BCB
        const bloco1 = { inicio: anoInicio, fim: anoInicio + 4 };     // 2006 - 2010
        const bloco2 = { inicio: bloco1.fim + 1, fim: bloco1.fim + 5 }; // 2011 - 2015
        const bloco3 = { inicio: bloco2.fim + 1, fim: bloco2.fim + 5 }; // 2016 - 2020
        const bloco4 = { inicio: bloco3.fim + 1, fim: anoFim };         // 2021 - 2025

        const criarUrl = (ini, fim) => `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_META_SELIC}/dados?formato=json&dataInicial=01/01/${ini}&dataFinal=31/12/${fim}`;

        // Executa as 4 requisições em paralelo de forma muito mais leve e rápida
        const [res1, res2, res3, res4] = await Promise.all([
            httpClient(criarUrl(bloco1.inicio, bloco1.fim)),
            httpClient(criarUrl(bloco2.inicio, bloco2.fim)),
            httpClient(criarUrl(bloco3.inicio, bloco3.fim)),
            httpClient(criarUrl(bloco4.inicio, bloco4.fim))
        ]);

        const dadosCompletos = [
            ...(Array.isArray(res1.data) ? res1.data : []),
            ...(Array.isArray(res2.data) ? res2.data : []),
            ...(Array.isArray(res3.data) ? res3.data : []),
            ...(Array.isArray(res4.data) ? res4.data : [])
        ];

        if (dadosCompletos.length === 0) {
            console.warn("[SELIC ADAPTER] Falha ao obter dados da Meta Selic.");
            return { sucesso: false, slug: 'selic' };
        }

        const mapaAnual = {};

        // Varre todos os dados e captura a última meta de dezembro de cada ano
        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const partes = item.data.split('/');
                const ano = partes[2];
                const mes = partes[1];
                const valorNumerico = Number(item.valor);
                
                if (!isNaN(valorNumerico)) {
                    if (mes === '12' || !mapaAnual[ano]) {
                        mapaAnual[ano] = valorNumerico;
                    }
                }
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        if (anos.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'selic' },
                { 
                    titulo: 'Taxa Básica de Juros - Selic (% a.a.)', 
                    fonte: 'Banco Central (Meta Selic - Copom)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`[SELIC ADAPTER] Meta Selic de 20 anos (${anos.length} anos carregados) sincronizada com sucesso!`);
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

