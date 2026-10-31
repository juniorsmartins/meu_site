import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_INTERNET = 'IT.NET.USER.ZS'; // Usuários de Internet (% da população)

async function sincronizarInternet() {
    
    console.log(`[INTERNET ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990; // Série histórica do World Bank
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_INTERNET}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[INTERNET ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'internet' };
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
            return { sucesso: false, slug: 'internet' };
        }

        await indicadorRepository.upsert('internet', {
            titulo: 'Usuários de Internet (%)',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos,
            valores
        });

        console.log(`[INTERNET ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'internet' };

    } catch (e) {
        console.error("[INTERNET ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'internet' };
    }
}

export { 
    sincronizarInternet 
};

