import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR = 'IS.AIR.PSGR'; // Passageiros aéreos transportados (World Bank/ICAO)

async function sincronizarPassageirosAereos() {
    
    console.log(`[AÉREO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1970;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[AÉREO ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'passageiros_aereos' };
        }

        const dados = res.data[1];
        const anos = [];
        const valores = [];

        if (Array.isArray(dados)) {
            dados
                .filter(item => item.value !== null && item.date)
                .map(item => ({
                    ano: item.date,
                    valor: Number(item.value) / 1_000_000 // Converte para milhões
                }))
                .sort((a, b) => Number(a.ano) - Number(b.ano))
                .forEach(item => {
                    if (!isNaN(item.valor) && item.valor > 0) {
                        anos.push(item.ano);
                        valores.push(Number(item.valor.toFixed(2)));
                    }
                });
        }

        if (anos.length === 0) return { sucesso: false, slug: 'passageiros_aereos' };

        await indicadorRepository.upsert('passageiros_aereos', {
            titulo: 'Passageiros Aéreos (Milhões)',
            fonte: 'World Bank (ICAO/ANAC)',
            unidade: 'Milhões',
            anos,
            valores
        });

        console.log(`[AÉREO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'passageiros_aereos' };

    } catch (e) {
        console.error("[AÉREO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'passageiros_aereos' };
    }
}

export { 
    sincronizarPassageirosAereos 
};

