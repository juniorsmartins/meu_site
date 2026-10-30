import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const UNDP_API_KEY = process.env.UNDP_API_KEY;
const UNDP_INDICATOR_ID = 'mmr'; // Maternal Mortality Ratio
const PAIS_ISO = 'BRA';

async function sincronizarMortalidadeMaterna() {
    
    console.log(`[MORTALIDADE MATERNA] Iniciando sincronização via API do PNUD...`);

    if (!UNDP_API_KEY) {
        console.error("[MORTALIDADE MATERNA] Variável UNDP_API_KEY não configurada.");
        return { sucesso: false, slug: 'mortalidade_materna' };
    }

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const anos = [];
        const valores = [];

        for (let ano = anoInicio; ano <= anoFim; ano++) {
            const url = `https://hdrdata.org/api/CompositeIndices/query?apikey=${UNDP_API_KEY}&countryOrAggregation=${PAIS_ISO}&year=${ano}&indicator=${UNDP_INDICATOR_ID}&v=3.6`;
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
                const item = res.data[0];
                const valorMmr = Number(item.value);

                if (!isNaN(valorMmr) && valorMmr > 0) {
                    anos.push(String(ano));
                    valores.push(Number(valorMmr.toFixed(1)));
                }
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (anos.length === 0) {
            console.warn("[MORTALIDADE MATERNA] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'mortalidade_materna' };
        }

        await indicadorRepository.upsert('mortalidade_materna', {
            titulo: 'Mortalidade Materna',
            fonte: 'PNUD - HDR Data API',
            unidade: 'Óbitos / 100 mil nascidos',
            anos,
            valores
        });

        console.log(`[MORTALIDADE MATERNA] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'mortalidade_materna' };

    } catch (e) {
        console.error("[MORTALIDADE MATERNA] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'mortalidade_materna' };
    }
}

export { 
    sincronizarMortalidadeMaterna 
};

