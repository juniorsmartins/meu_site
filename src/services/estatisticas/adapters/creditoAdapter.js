import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_CREDITO = 20622; // Saldo da carteira de crédito em relação ao PIB (%)

async function sincronizarCredito() {
    
    console.log(`[CRÉDITO ADAPTER] Iniciando sincronização (Série 20622)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2007; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_CREDITO}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'credito' };
        }

        const mapaAnual = {};
        res.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, mes, ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                if (!isNaN(valor)) {
                    if (!mapaAnual[ano] || mes === '12') {
                        mapaAnual[ano] = valor;
                    }
                }
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'credito' },
            {
                titulo: 'Estoque de Crédito (% do PIB)',
                fonte: 'Banco Central do Brasil (Série 20622)',
                unidade: '%',
                anos, 
                valores, 
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[CRÉDITO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'credito' };

    } catch (e) {
        console.error("[CRÉDITO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'credito' };
    }
}

export { 
    sincronizarCredito 
};

