import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_BANDA_LARGA = 'IT.NET.BBND.P2'; // Assinaturas de Banda Larga Fixa (por 100 pessoas)

async function sincronizarBandaLarga() {
    
    console.log(`[BANDA LARGA ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_BANDA_LARGA}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[BANDA LARGA ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'banda_larga' };
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
            return { sucesso: false, slug: 'banda_larga' };
        }

        await indicadorRepository.upsert('banda_larga', {
            titulo: 'Banda Larga Fixa (por 100 hab.)',
            fonte: 'World Bank Open Data',
            unidade: 'Assinaturas / 100 hab.',
            anos,
            valores
        });

        console.log(`[BANDA LARGA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'banda_larga' };

    } catch (e) {
        console.error("[BANDA LARGA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'banda_larga' };
    }
}

export { 
    sincronizarBandaLarga 
};

