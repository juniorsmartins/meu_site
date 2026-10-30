import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const UNDP_API_KEY = process.env.UNDP_API_KEY; // Chave de API do PNUD
const UNDP_INDICATOR_ID = 137506; // Código oficial do IDH no PNUD. Representa o indicador de IDH na API do PNUD.
const PAIS_ISO = 'BRA'; // Brasil - Código ISO 3166-1 alpha-3. Representa o Brasil na API do PNUD

async function sincronizarIdh() {

    console.log(`[IDH ADAPTER] Iniciando sincronização via API do PNUD...`);

    if (!UNDP_API_KEY) {
        console.error("[IDH ADAPTER] Variável UNDP_API_KEY não configurada.");
        return { sucesso: false, slug: 'idh' };
    }

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const anos = [];
        const valores = [];

        // A API do PNUD exige a consulta ano a ano.
        // Faremos requisições sequenciais com uma pequena pausa para evitar rate limit.
        for (let ano = anoInicio; ano <= anoFim; ano++) {
            const url = `https://hdrdata.org/api/CompositeIndices/query?apikey=${UNDP_API_KEY}&countryOrAggregation=${PAIS_ISO}&year=${ano}&indicator=${UNDP_INDICATOR_ID}&v=3.6`;
            
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
                // A API retorna um array de objetos. O valor do IDH está em "value".
                const item = res.data[0];
                const valorHdi = Number(item.value);

                if (!isNaN(valorHdi) && valorHdi > 0) {
                    anos.push(String(ano));
                    valores.push(Number(valorHdi.toFixed(3))); // IDH tem 3 casas decimais
                }
            } else {
                console.warn(`[IDH ADAPTER] Sem dados para o ano ${ano}.`);
            }

            // Pausa de 500ms entre as requisições para não sobrecarregar a API do PNUD
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (anos.length === 0) {
            console.warn("[IDH ADAPTER] Nenhum dado válido foi retornado pela API do PNUD.");
            return { sucesso: false, slug: 'idh' };
        }

        await indicadorRepository.upsert('idh', {
            titulo: 'IDH - Índice de Desenvolvimento Humano',
            fonte: 'PNUD - HDR Data API',
            unidade: 'Índice (0 a 1)',
            anos,
            valores
        });

        console.log(`[IDH ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'idh' };

    } catch (e) {
        console.error("[IDH ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'idh' };
    }
}

export { 
    sincronizarIdh 
};

