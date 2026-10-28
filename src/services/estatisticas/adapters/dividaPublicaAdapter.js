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

async function sincronizarDivida() {

    console.log(`[DÍVIDA ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1;

        const buscarSerie = async (serieConfig) => {
            const dadosMapa = {};
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieConfig.codigo}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
            
            const res = await httpClient(url);
            if (res.ok && Array.isArray(res.data)) {
                res.data.forEach(item => {
                    if (item.data && item.data.includes('/')) {
                        const [, mes, anoStr] = item.data.split('/');
                        const valor = Number(item.valor);
                        if (!isNaN(valor)) {
                            if (!dadosMapa[anoStr] || mes === '12') {
                                dadosMapa[anoStr] = valor;
                            }
                        }
                    }
                });
            }
            return dadosMapa;
        };

        const dadosLiquida = await buscarSerie(SERIES.liquida);
        const anosLiquida = Object.keys(dadosLiquida).sort((a, b) => Number(a) - Number(b));
        if (anosLiquida.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: SERIES.liquida.slug },
                { 
                    titulo: SERIES.liquida.titulo, 
                    fonte: SERIES.liquida.fonte, 
                    unidade: '%', 
                    anos: anosLiquida, 
                    valores: anosLiquida.map(a => dadosLiquida[a]), 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
        }

        const dadosBruta = await buscarSerie(SERIES.bruta);
        const anosBruta = Object.keys(dadosBruta).sort((a, b) => Number(a) - Number(b));
        if (anosBruta.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: SERIES.bruta.slug },
                { 
                    titulo: SERIES.bruta.titulo, 
                    fonte: SERIES.bruta.fonte, 
                    unidade: '%', 
                    anos: anosBruta, 
                    valores: anosBruta.map(a => dadosBruta[a]), 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log(`[DÍVIDA ADAPTER] Sincronizado com sucesso!`);
        return { sucesso: true, slug: 'divida' };

    } catch (e) {
        console.error("[DÍVIDA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'divida' };
    }
}

export { 
    sincronizarDivida 
};

