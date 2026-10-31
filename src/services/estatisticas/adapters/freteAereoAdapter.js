import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_FRETE = 'IS.AIR.GOOD.MT.K1'; // Air transport, freight (milhões ton-km)

async function sincronizarFreteAereo() {

    console.log(`[FRETE AÉREO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990; // Pode buscar desde 1970
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_FRETE}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[FRETE AÉREO ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'frete_aereo' };
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

        if (anos.length === 0) return { sucesso: false, slug: 'frete_aereo' };

        await indicadorRepository.upsert('frete_aereo', {
            titulo: 'Frete Aéreo (Milhões ton-km)',
            fonte: 'World Bank Open Data',
            unidade: 'Milhões ton-km',
            anos,
            valores
        });

        console.log(`[FRETE AÉREO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'frete_aereo' };

    } catch (e) {
        console.error("[FRETE AÉREO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'frete_aereo' };
    }
}

export { 
    sincronizarFreteAereo 
};

