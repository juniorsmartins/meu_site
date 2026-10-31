import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';

// Códigos oficiais no World Bank
const INDICADORES = {
    idosos: 'SP.POP.65UP.TO.ZS', // População com 65 anos ou mais (% do total)
    jovens: 'SP.POP.0014.TO.ZS'  // População de 0 a 14 anos (% do total)
};

async function sincronizarEnvelhecimento() {
    
    console.log(`[ENVELHECIMENTO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1960;
        const anoFim = anoAtual - 1;

        const mapaAnos = {}; // { "1960": { idosos: 3.0, jovens: 42.0 }, ... }

        // Faz uma requisição para cada grupo etário
        for (const [grupo, codigoIndicador] of Object.entries(INDICADORES)) {
            const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${codigoIndicador}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
            
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data) && res.data.length === 2) {
                const dados = res.data[1];

                if (Array.isArray(dados)) {
                    dados.forEach(item => {
                        const ano = item.date;
                        const valor = Number(item.value);

                        // Ignora anos sem dados
                        if (ano && !isNaN(valor) && valor > 0) {
                            if (!mapaAnos[ano]) mapaAnos[ano] = {};
                            mapaAnos[ano][grupo] = valor;
                        }
                    });
                }
            } else {
                console.warn(`[ENVELHECIMENTO ADAPTER] Falha ao obter dados para ${grupo}.`);
            }

            // Pausa entre as requisições
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Calcula o Índice de Envelhecimento
        const anosFinais = [];
        const valoresFinais = [];

        const anosOrdenados = Object.keys(mapaAnos).sort((a, b) => Number(a) - Number(b));

        anosOrdenados.forEach(ano => {
            const dadosAno = mapaAnos[ano];
            
            // Só calcula se tivermos os dois valores no mesmo ano
            if (dadosAno.idosos && dadosAno.jovens) {
                // Fórmula: (Percentual de Idosos / Percentual de Jovens) * 100
                const indice = (dadosAno.idosos / dadosAno.jovens) * 100;
                
                anosFinais.push(ano);
                valoresFinais.push(Number(indice.toFixed(2))); // 2 casas decimais
            }
        });

        if (anosFinais.length === 0) {
            console.warn("[ENVELHECIMENTO ADAPTER] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'envelhecimento' };
        }

        await indicadorRepository.upsert('envelhecimento', {
            titulo: 'Índice de Envelhecimento (%)',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos: anosFinais,
            valores: valoresFinais
        });

        console.log(`[ENVELHECIMENTO ADAPTER] Sincronizado com sucesso! (${anosFinais.length} anos)`);
        return { sucesso: true, slug: 'envelhecimento' };

    } catch (e) {
        console.error("[ENVELHECIMENTO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'envelhecimento' };
    }
}

export { 
    sincronizarEnvelhecimento 
};

