import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_RODOVIAS = 'IS.ROD.PAVE.ZS'; // Roads, paved (% of total roads)

async function sincronizarMalhaRodoviaria() {
    
    console.log(`[MALHA RODOVIÁRIA ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_RODOVIAS}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[MALHA RODOVIÁRIA ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'malha_rodoviaria' };
        }

        const dados = res.data[1];
        const anos = [];
        const valores = [];

        if (Array.isArray(dados)) {
            const dadosOrdenados = dados
                .filter(item => item.value !== null && item.date)
                .map(item => ({ ano: item.date, valor: Number(item.value) }))
                .sort((a, b) => Number(a.ano) - Number(b.ano));

            dadosOrdenados.forEach(item => {
                if (!isNaN(item.valor) && item.valor >= 0) {
                    anos.push(item.ano);
                    valores.push(Number(item.valor.toFixed(2)));
                }
            });
        }

        if (anos.length === 0) return { sucesso: false, slug: 'malha_rodoviaria' };

        await indicadorRepository.upsert('malha_rodoviaria', {
            titulo: 'Malha Rodoviária Pavimentada (%)',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos,
            valores
        });

        console.log(`[MALHA RODOVIÁRIA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'malha_rodoviaria' };

    } catch (e) {
        console.error("[MALHA RODOVIÁRIA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'malha_rodoviaria' };
    }
}

export { 
    sincronizarMalhaRodoviaria 
};

