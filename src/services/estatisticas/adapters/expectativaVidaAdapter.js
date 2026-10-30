import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';

const INDICADORES = {
    mulheres: 'SP.DYN.LE00.FE.IN',
    homens: 'SP.DYN.LE00.MA.IN'
};

async function sincronizarExpectativaVida() {

    console.log(`[EXPECTATIVA VIDA ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 1960; // Série histórica do World Bank
        const anoFim = anoAtual - 1;

        const mapaAnos = {}; 

        for (const [sexo, codigoIndicador] of Object.entries(INDICADORES)) {
            const url = `https://api.worldbank.org/v2/country/${PAIS_ISO}/indicator/${codigoIndicador}?format=json&per_page=1000&date=${anoInicio}:${anoFim}`;
            
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data) && res.data.length === 2) {
                const dados = res.data[1];

                if (Array.isArray(dados)) {
                    dados.forEach(item => {
                        const ano = item.date;
                        const valor = Number(item.value);

                        if (ano && !isNaN(valor) && valor > 0) {
                            if (!mapaAnos[ano]) mapaAnos[ano] = {};
                            mapaAnos[ano][sexo] = Number(valor.toFixed(1));
                        }
                    });
                }
            } else {
                console.warn(`[EXPECTATIVA VIDA ADAPTER] Falha ao obter dados para ${sexo}.`);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Separa os anos que têm dados completos para ambos os sexos
        const anosFinais = [];
        const valoresHomens = [];
        const valoresMulheres = [];

        const anosOrdenados = Object.keys(mapaAnos).sort((a, b) => Number(a) - Number(b));

        anosOrdenados.forEach(ano => {
            const dadosAno = mapaAnos[ano];
            if (dadosAno.homens && dadosAno.mulheres) {
                anosFinais.push(ano);
                valoresHomens.push(dadosAno.homens);
                valoresMulheres.push(dadosAno.mulheres);
            }
        });

        if (anosFinais.length === 0) {
            console.warn("[EXPECTATIVA VIDA ADAPTER] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'expectativa_vida' };
        }

        // --- SALVANDO SEPARADAMENTE NO MONGODB ---

        // 1. Salva Homens
        await indicadorRepository.upsert('expectativa_vida_homens', {
            titulo: 'Expectativa de Vida - Homens',
            fonte: 'World Bank Open Data',
            unidade: 'Anos',
            anos: anosFinais,
            valores: valoresHomens
        });

        // 2. Salva Mulheres
        await indicadorRepository.upsert('expectativa_vida_mulheres', {
            titulo: 'Expectativa de Vida - Mulheres',
            fonte: 'World Bank Open Data',
            unidade: 'Anos',
            anos: anosFinais,
            valores: valoresMulheres
        });

        console.log(`[EXPECTATIVA VIDA ADAPTER] Sincronizado com sucesso! (${anosFinais.length} anos)`);
        return { sucesso: true, slug: 'expectativa_vida' };

    } catch (e) {
        console.error("[EXPECTATIVA VIDA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'expectativa_vida' };
    }
}

export { 
    sincronizarExpectativaVida 
};

