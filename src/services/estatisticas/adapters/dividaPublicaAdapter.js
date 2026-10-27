import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIES = {
    liquida: { 
        codigo: 4513, 
        slug: 'divida_liquida', 
        titulo: 'Dívida Líquida do Setor Público (% do PIB)', 
        fonte: 'Banco Central (Série 4513)' 
    },
    bruta: { 
        codigo: 13762, 
        slug: 'divida_bruta', 
        titulo: 'Dívida Bruta do Governo Geral (% do PIB)', 
        fonte: 'Banco Central (Série 13762)' 
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarDivida() {

    console.log(`[DÍVIDA ADAPTER] Iniciando sincronização (DLSP e DBGG)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1;

        // Função interna para buscar uma série em blocos de 4 anos
        const buscarSerieEmBlocos = async (serieConfig) => {
            const dadosMapa = {};
            
            for (let ano = anoInicio; ano <= anoFim; ano += 4) {
                const fimBloco = Math.min(ano + 3, anoFim);
                const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieConfig.codigo}/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=31/12/${fimBloco}`;
                
                try {
                    const res = await httpClient(url);
                    if (Array.isArray(res.data)) {
                        res.data.forEach(item => {
                            if (item.data && item.data.includes('/')) {
                                const [dia, mes, anoStr] = item.data.split('/');
                                const valor = Number(item.valor);
                                
                                if (!isNaN(valor)) {
                                    // Guarda o valor de dezembro (fechamento do ano)
                                    if (!dadosMapa[anoStr] || mes === '12') {
                                        dadosMapa[anoStr] = valor;
                                    }
                                }
                            }
                        });
                        console.log(`[DÍVIDA ADAPTER] Série ${serieConfig.codigo} bloco ${ano}-${fimBloco} OK`);
                    }
                } catch (err) {
                    console.warn(`[DÍVIDA ADAPTER] Falha série ${serieConfig.codigo} bloco ${ano}-${fimBloco}:`, err.message);
                }
                await sleep(3000); // Pausa para não bloquear o BCB
            }
            return dadosMapa;
        };

        // Executa para Dívida Líquida
        console.log(`[DÍVIDA ADAPTER] Buscando Dívida Líquida (${SERIES.liquida.codigo})...`);
        const dadosLiquida = await buscarSerieEmBlocos(SERIES.liquida);
        const anosLiquida = Object.keys(dadosLiquida).sort((a, b) => Number(a) - Number(b));
        const valoresLiquida = anosLiquida.map(ano => dadosLiquida[ano]);

        if (anosLiquida.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: SERIES.liquida.slug },
                { 
                    titulo: SERIES.liquida.titulo, 
                    fonte: SERIES.liquida.fonte, 
                    unidade: '%', 
                    anos: anosLiquida, 
                    valores: valoresLiquida, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`[DÍVIDA ADAPTER] Dívida Líquida salva (${anosLiquida.length} anos).`);
        }

        // Executa para Dívida Bruta
        console.log(`[DÍVIDA ADAPTER] Buscando Dívida Bruta (${SERIES.bruta.codigo})...`);
        const dadosBruta = await buscarSerieEmBlocos(SERIES.bruta);
        const anosBruta = Object.keys(dadosBruta).sort((a, b) => Number(a) - Number(b));
        const valoresBruta = anosBruta.map(ano => dadosBruta[ano]);

        if (anosBruta.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: SERIES.bruta.slug },
                { 
                    titulo: SERIES.bruta.titulo, 
                    fonte: SERIES.bruta.fonte, 
                    unidade: '%', 
                    anos: anosBruta, 
                    valores: valoresBruta, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`[DÍVIDA ADAPTER] Dívida Bruta salva (${anosBruta.length} anos).`);
        }

        return { sucesso: true, slug: 'divida' };

    } catch (e) {
        console.error("[DÍVIDA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'divida' };
    }
}

export { 
    sincronizarDivida 
};

