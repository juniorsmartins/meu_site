import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR = 'IS.AIR.PSGR'; // Passageiros aéreos transportados (World Bank/ICAO)

async function sincronizarPassageirosAereos() {
    
    console.log(`[AÉREO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        // Reduzimos o período para evitar retorno null da API
        const anoInicio = 1990; 
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        // Validação rigorosa: garante que a API retornou um array com metadados e dados
        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[AÉREO ADAPTER] Falha ao obter dados da API do World Bank.");
            return { sucesso: false, slug: 'passageiros_aereos' };
        }

        const dados = res.data[1];

        // Se a API retornar null para o array de dados, aborta graciosamente
        if (!Array.isArray(dados) || dados.length === 0) {
            console.warn("[AÉREO ADAPTER] A API do World Bank retornou vazio (null) para este período.");
            return { sucesso: false, slug: 'passageiros_aereos' };
        }

        const anos = [];
        const valores = [];

        const dadosOrdenados = dados
            .filter(item => item.value !== null && item.date)
            .map(item => ({
                ano: item.date,
                valor: Number(item.value) / 1_000_000 // Converte para milhões
            }))
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        dadosOrdenados.forEach(item => {
            if (!isNaN(item.valor) && item.valor > 0) {
                anos.push(item.ano);
                valores.push(Number(item.valor.toFixed(2)));
            }
        });

        if (anos.length === 0) {
            console.warn("[AÉREO ADAPTER] Nenhum dado válido processado após filtragem.");
            return { sucesso: false, slug: 'passageiros_aereos' };
        }

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

