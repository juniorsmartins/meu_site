import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIES = {
    liquida: 4513,
    bruta: 13762
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarDivida() {
    console.log(`[DÍVIDA ADAPTER] Iniciando sincronização (DLSP e DBGG)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; // Início comum para ambas as séries
        const anoFim = anoAtual - 1;

        const dadosLiquida = {};
        const dadosBruta = {};

        // Helper para buscar e agregar uma série
        const buscarSerie = async (codigo, mapaDestino) => {
            console.log(`[DÍVIDA ADAPTER] Buscando série ${codigo} (${anoInicio}-${anoFim})...`);
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
            
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    res.data.forEach(item => {
                        if (item.data && item.data.includes('/')) {
                            const [dia, mes, ano] = item.data.split('/');
                            const valor = Number(item.valor);
                            
                            if (!isNaN(valor)) {
                                // Armazena o valor de dezembro (fechamento do ano)
                                if (!mapaDestino[ano] || mes === '12') {
                                    mapaDestino[ano] = valor;
                                }
                            }
                        }
                    });
                    console.log(`[DÍVIDA ADAPTER] Série ${codigo} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[DÍVIDA ADAPTER] Falha na série ${codigo}:`, err.message);
            }
            await sleep(2000); // Pausa entre as duas séries
        };

        // Executa sequencialmente para não sobrecarregar o BCB
        await buscarSerie(SERIES.liquida, dadosLiquida);
        await buscarSerie(SERIES.bruta, dadosBruta);

        // Constrói o array final (anos onde pelo menos uma das séries tem dado)
        const todosAnos = Array.from(new Set([...Object.keys(dadosLiquida), ...Object.keys(dadosBruta)]))
            .sort((a, b) => Number(a) - Number(b));

        if (todosAnos.length === 0) {
            console.warn("[DÍVIDA ADAPTER] Nenhum dado válido foi encontrado.");
            return { sucesso: false, slug: 'divida' };
        }

        const anos = todosAnos;
        const valoresLiquida = todosAnos.map(ano => dadosLiquida[ano] ?? null);
        const valoresBruta = todosAnos.map(ano => dadosBruta[ano] ?? null);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'divida' },
            {
                titulo: 'Dívida Pública (% do PIB)',
                fonte: 'Banco Central do Brasil (Séries 4513 e 13762)',
                unidade: '%',
                anos,
                valores: [valoresLiquida, valoresBruta], // Array de arrays
                meta: {
                    labels: ['Dívida Líquida', 'Dívida Bruta']
                },
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[DÍVIDA ADAPTER] Dívida sincronizada com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'divida' };

    } catch (e) {
        console.error("[DÍVIDA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'divida' };
    }
}

export { 
    sincronizarDivida 
};

