import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_CREDITO = 20622; // Saldo da carteira de crédito em relação ao PIB (%)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarCredito() {
    
    console.log(`[CRÉDITO ADAPTER] Iniciando sincronização (Série 20622)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        // A série 20622 começa em março de 2007
        const anoInicio = 2007; 
        const anoFim = anoAtual - 1;

        console.log(`[CRÉDITO ADAPTER] Buscando histórico (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const dadosCompletos = [];

        for (const bloco of blocos) {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_CREDITO}/dados?formato=json&dataInicial=01/01/${bloco.inicio}&dataFinal=31/12/${bloco.fim}`;
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[CRÉDITO ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[CRÉDITO ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            await sleep(1000);
        }

        if (dadosCompletos.length === 0) {
            console.warn("[CRÉDITO ADAPTER] Nenhum dado retornado.");
            return { sucesso: false, slug: 'credito' };
        }

        const mapaAnual = {};

        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, mes, ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                if (!isNaN(valor)) {
                    // Como é um estoque, guardamos o valor de dezembro (fechamento do ano)
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

        console.log(`[CRÉDITO ADAPTER] Estoque de Crédito sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'credito' };

    } catch (e) {
        console.error("[CRÉDITO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'credito' };
    }
}

export { 
    sincronizarCredito 
};

