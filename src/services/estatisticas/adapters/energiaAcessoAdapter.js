import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_ACESSO = 'EG.ELC.ACCS.ZS'; // Acesso à eletricidade (% da população)

async function sincronizarEnergiaAcesso() {
    
    console.log(`[ENERGIA ACESSO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990; // Série do World Bank para acesso à energia
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_ACESSO}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[ENERGIA ACESSO ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'energia_acesso' };
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
            return { sucesso: false, slug: 'energia_acesso' };
        }

        await indicadorRepository.upsert('energia_acesso', {
            titulo: 'Acesso à Energia Elétrica (%)',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos,
            valores
        });

        console.log(`[ENERGIA ACESSO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'energia_acesso' };

    } catch (e) {
        console.error("[ENERGIA ACESSO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'energia_acesso' };
    }
}

export { 
    sincronizarEnergiaAcesso 
};

