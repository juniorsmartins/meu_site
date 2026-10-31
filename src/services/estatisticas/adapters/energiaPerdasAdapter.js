import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_PERDAS = 'EG.ELC.LOSS.ZS'; // Perdas na transmissão e distribuição (%)

async function sincronizarEnergiaPerdas() {
    
    console.log(`[ENERGIA PERDAS ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990; 
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_PERDAS}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[ENERGIA PERDAS ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'energia_perdas' };
        }

        const dados = res.data[1];
        const anos = [];
        const valores = [];

        if (Array.isArray(dados)) {
            const dadosOrdenados = dados
                .filter(item => item.value !== null && item.date)
                .map(item => ({
                    ano: item.date,
                    valor: Number(item.value)
                }))
                .sort((a, b) => Number(a.ano) - Number(b.ano));

            dadosOrdenados.forEach(item => {
                if (!isNaN(item.valor) && item.valor >= 0) {
                    anos.push(item.ano);
                    valores.push(Number(item.valor.toFixed(2)));
                }
            });
        }

        if (anos.length === 0) {
            return { sucesso: false, slug: 'energia_perdas' };
        }

        await indicadorRepository.upsert('energia_perdas', {
            titulo: 'Perdas de Energia (%)',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos,
            valores
        });

        console.log(`[ENERGIA PERDAS ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'energia_perdas' };

    } catch (e) {
        console.error("[ENERGIA PERDAS ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'energia_perdas' };
    }
}

export { 
    sincronizarEnergiaPerdas 
};

