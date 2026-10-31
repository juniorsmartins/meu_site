import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';
const INDICADOR_DIESEL = 'IS.ROD.DESL.KT'; 

async function sincronizarConsumoDiesel() {
    
    console.log(`[CONSUMO DIESEL ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1990;
        const anoFim = anoAtual - 1;

        const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${INDICADOR_DIESEL}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length !== 2) {
            console.warn("[CONSUMO DIESEL ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'consumo_diesel' };
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

        if (anos.length === 0) return { sucesso: false, slug: 'consumo_diesel' };

        await indicadorRepository.upsert('consumo_diesel', {
            titulo: 'Consumo de Diesel no Setor Rodoviário (kt)',
            fonte: 'World Bank Open Data',
            unidade: 'kt',
            anos,
            valores
        });

        console.log(`[CONSUMO DIESEL ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'consumo_diesel' };

    } catch (e) {
        console.error("[CONSUMO DIESEL ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'consumo_diesel' };
    }
}

export { 
    sincronizarConsumoDiesel 
};

