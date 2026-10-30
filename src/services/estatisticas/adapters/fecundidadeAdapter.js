import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_FECUNDIDADE = 'SP.DYN.TFRT.IN';

async function sincronizarFecundidade() {
    
    console.log(`[FECUNDIDADE ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1960;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_FECUNDIDADE}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[FECUNDIDADE ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'fecundidade' };
        }

        const dados = res.data[1];
        const anos = [];
        const valores = [];

        if (Array.isArray(dados)) {
            // Ordena por ano (a API pode retornar em ordem decrescente)
            const dadosOrdenados = dados
                .filter(item => item.value !== null && item.date)
                .map(item => ({
                    ano: item.date,
                    valor: Number(item.value)
                }))
                .sort((a, b) => Number(a.ano) - Number(b.ano));

            dadosOrdenados.forEach(item => {
                if (!isNaN(item.valor) && item.valor > 0) {
                    anos.push(item.ano);
                    valores.push(Number(item.valor.toFixed(2)));
                }
            });
        }

        if (anos.length === 0) {
            console.warn("[FECUNDIDADE ADAPTER] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'fecundidade' };
        }

        await indicadorRepository.upsert('fecundidade', {
            titulo: 'Taxa de Fecundidade Total',
            fonte: 'World Bank Open Data',
            unidade: 'Filhos por Mulher',
            anos,
            valores
        });

        console.log(`[FECUNDIDADE ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'fecundidade' };

    } catch (e) {
        console.error("[FECUNDIDADE ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'fecundidade' };
    }
}

export { 
    sincronizarFecundidade 
};

