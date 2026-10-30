import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const UNDP_API_KEY = process.env.UNDP_API_KEY;
const PAIS_ISO = 'BRA';

async function sincronizarIdh() {
    
    console.log(`[IDH ADAPTER] Iniciando sincronização (IDH e IDHI)...`);

    if (!UNDP_API_KEY) {
        console.error("[IDH ADAPTER] Variável UNDP_API_KEY não configurada.");
        return { sucesso: false, slug: 'idh' };
    }

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const mapaAnos = {}; // { "1990": { hdi: 0.6, ihdi: 0.4 }, ... }

        for (let ano = anoInicio; ano <= anoFim; ano++) {
            // Requisição para o HDI
            const urlHdi = `https://hdrdata.org/api/CompositeIndices/query?apikey=${UNDP_API_KEY}&countryOrAggregation=${PAIS_ISO}&year=${ano}&indicator=hdi&v=3.6`;
            const resHdi = await httpClient(urlHdi);

            // Requisição para o IHDI
            const urlIhdi = `https://hdrdata.org/api/CompositeIndices/query?apikey=${UNDP_API_KEY}&countryOrAggregation=${PAIS_ISO}&year=${ano}&indicator=ihdi&v=3.6`;
            const resIhdi = await httpClient(urlIhdi);

            let valorHdi = null;
            let valorIhdi = null;

            if (resHdi.ok && Array.isArray(resHdi.data) && resHdi.data.length > 0) {
                valorHdi = Number(resHdi.data[0].value);
            }
            if (resIhdi.ok && Array.isArray(resIhdi.data) && resIhdi.data.length > 0) {
                valorIhdi = Number(resIhdi.data[0].value);
            }

            // Só adiciona o ano se tivermos os dois valores (para o gráfico não quebrar)
            if (valorHdi && !isNaN(valorHdi) && valorIhdi && !isNaN(valorIhdi)) {
                mapaAnos[ano] = {
                    hdi: Number(valorHdi.toFixed(3)),
                    ihdi: Number(valorIhdi.toFixed(3))
                };
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const anos = Object.keys(mapaAnos).sort((a, b) => Number(a) - Number(b));
        
        if (anos.length === 0) {
            console.warn("[IDH ADAPTER] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'idh' };
        }

        const valoresHdi = anos.map(ano => mapaAnos[ano].hdi);
        const valoresIhdi = anos.map(ano => mapaAnos[ano].ihdi);

        // Salva IDH
        await indicadorRepository.upsert('idh', {
            titulo: 'IDH - Índice de Desenvolvimento Humano',
            fonte: 'PNUD - HDR Data API',
            unidade: 'Índice (0 a 1)',
            anos,
            valores: valoresHdi
        });

        // Salva IDHI
        await indicadorRepository.upsert('idhi', {
            titulo: 'IDH Ajustado pela Desigualdade',
            fonte: 'PNUD - HDR Data API',
            unidade: 'Índice (0 a 1)',
            anos,
            valores: valoresIhdi
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

