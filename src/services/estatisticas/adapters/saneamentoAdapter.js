import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const PAIS_ISO = 'BRA';

const INDICADORES = {
    agua: 'SH.H2O.BASW.ZS',   // Acesso a água potável básica (%)
    esgoto: 'SH.STA.BASS.ZS'  // Acesso a saneamento básico (%)
};

async function sincronizarSaneamento() {
    
    console.log(`[SANEAMENTO ADAPTER] Iniciando sincronização via World Bank...`);

    try {
        const anoAtual = new Date().getFullYear();
        const anoInicio = 2000; // Série do World Bank para saneamento costuma ser mais recente
        const anoFim = anoAtual - 1;

        const mapaAnos = {}; 

        for (const [tipo, codigoIndicador] of Object.entries(INDICADORES)) {
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
                            mapaAnos[ano][tipo] = Number(valor.toFixed(1));
                        }
                    });
                }
            } else {
                console.warn(`[SANEAMENTO ADAPTER] Falha ao obter dados para ${tipo}.`);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Separa os anos que têm dados completos
        const anosFinais = [];
        const valoresAgua = [];
        const valoresEsgoto = [];

        const anosOrdenados = Object.keys(mapaAnos).sort((a, b) => Number(a) - Number(b));

        anosOrdenados.forEach(ano => {
            const dadosAno = mapaAnos[ano];
            if (dadosAno.agua && dadosAno.esgoto) {
                anosFinais.push(ano);
                valoresAgua.push(dadosAno.agua);
                valoresEsgoto.push(dadosAno.esgoto);
            }
        });

        if (anosFinais.length === 0) {
            console.warn("[SANEAMENTO ADAPTER] Nenhum dado válido retornado.");
            return { sucesso: false, slug: 'saneamento' };
        }

        // Salva Água
        await indicadorRepository.upsert('saneamento_agua', {
            titulo: 'Acesso à Água Tratada',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos: anosFinais,
            valores: valoresAgua
        });

        // Salva Esgoto
        await indicadorRepository.upsert('saneamento_esgoto', {
            titulo: 'Acesso à Coleta de Esgoto',
            fonte: 'World Bank Open Data',
            unidade: '%',
            anos: anosFinais,
            valores: valoresEsgoto
        });

        console.log(`[SANEAMENTO ADAPTER] Sincronizado com sucesso! (${anosFinais.length} anos)`);
        return { sucesso: true, slug: 'saneamento' };

    } catch (e) {
        console.error("[SANEAMENTO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'saneamento' };
    }
}

export { 
    sincronizarSaneamento 
};

