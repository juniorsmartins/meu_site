import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
// Indicador de Consumo de Energia no Setor Rodoviário
const INDICADOR_ENERGIA = 'IS.ROD.ENGY.KT'; 

async function sincronizarConsumoEnergiaRodoviaria() {
    console.log(`[ENERGIA RODOVIÁRIA ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_ENERGIA}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[ENERGIA RODOVIÁRIA ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'consumo_energia_rodoviaria' };
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
                    valores.push(Number(item.valor.toFixed(0))); // Valores inteiros (kt)
                }
            });
        }

        if (anos.length === 0) return { sucesso: false, slug: 'consumo_energia_rodoviaria' };

        await indicadorRepository.upsert('consumo_energia_rodoviaria', {
            titulo: 'Consumo de Energia no Setor Rodoviário (kt)',
            fonte: 'World Bank Open Data',
            unidade: 'kt',
            anos,
            valores
        });

        console.log(`[ENERGIA RODOVIÁRIA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'consumo_energia_rodoviaria' };

    } catch (e) {
        console.error("[ENERGIA RODOVIÁRIA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'consumo_energia_rodoviaria' };
    }
}

export { 
    sincronizarConsumoEnergiaRodoviaria 
};

