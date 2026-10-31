import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_MORTALIDADE = 'SP.DYN.IMRT.IN'; // Mortalidade infantil (por 1000 nascidos vivos)

async function sincronizarMortalidadeInfantil() {
    
    console.log(`[MORTALIDADE INFANTIL ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1960;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_MORTALIDADE}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[MORTALIDADE INFANTIL ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'mortalidade_infantil' };
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
                    valores.push(Number(item.valor.toFixed(1))); // 1 casa decimal
                }
            });
        }

        if (anos.length === 0) {
            return { sucesso: false, slug: 'mortalidade_infantil' };
        }

        await indicadorRepository.upsert('mortalidade_infantil', {
            titulo: 'Taxa de Mortalidade Infantil',
            fonte: 'World Bank Open Data',
            unidade: 'Óbitos / 1000 nascidos',
            anos,
            valores
        });

        console.log(`[MORTALIDADE INFANTIL ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'mortalidade_infantil' };

    } catch (e) {
        console.error("[MORTALIDADE INFANTIL ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'mortalidade_infantil' };
    }
}

export { 
    sincronizarMortalidadeInfantil 
};

