import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

// Código 432 = Taxa de juros - Meta Selic definida pelo Copom
const SERIE_BCB_META_SELIC = 432;

async function sincronizarSelic(agora) {
    try {
        // Define o intervalo de 20 anos concluídos (do ano anterior para trás)
        const anoAtual = new Date().getFullYear();
        const anoFimBloco1 = anoAtual - 1;       // Ex: 2025
        const anoInicioBloco1 = anoFimBloco1 - 9; // Ex: 2016 (Bloco 1: 10 anos)

        const anoFimBloco2 = anoInicioBloco1 - 1; // Ex: 2015
        const anoInicioBloco2 = anoFimBloco2 - 9; // Ex: 2006 (Bloco 2: 10 anos)

        const urlBloco1 = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_META_SELIC}/dados?formato=json&dataInicial=01/01/${anoInicioBloco1}&dataFinal=31/12/${anoFimBloco1}`;
        const urlBloco2 = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_META_SELIC}/dados?formato=json&dataInicial=01/01/${anoInicioBloco2}&dataFinal=31/12/${anoFimBloco2}`;

        console.log(`[SELIC ADAPTER] Busca Meta Selic histórica de 20 anos (${anoInicioBloco2} a ${anoFimBloco1})...`);

        // Executa as duas requisições de 10 anos em paralelo para respeitar o limite da API do BCB
        const [respostaBloco1, respostaBloco2] = await Promise.all([
            httpClient(urlBloco2), // Mais antigo (2006 - 2015)
            httpClient(urlBloco1)  // Mais recente (2016 - 2025)
        ]);

        const dadosCompletos = [
            ...(Array.isArray(respostaBloco2.data) ? respostaBloco2.data : []),
            ...(Array.isArray(respostaBloco1.data) ? respostaBloco1.data : [])
        ];

        if (dadosCompletos.length === 0) {
            console.warn("[SELIC ADAPTER] Falha ao obter dados da Meta Selic.");
            return { sucesso: false, slug: 'selic' };
        }

        const mapaAnual = {};

        // Varre todos os dados diários consolidados e captura a última meta de cada ano
        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const partes = item.data.split('/');
                const ano = partes[2];
                const mes = partes[1];
                const valorNumerico = Number(item.valor);
                
                if (!isNaN(valorNumerico)) { // Apenas considera valores numéricos válidos
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
            console.log("[SELIC ADAPTER] Meta Selic de 20 anos sincronizada com sucesso!");
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

