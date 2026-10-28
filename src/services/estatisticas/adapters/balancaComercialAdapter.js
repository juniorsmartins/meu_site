import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_BALANCA = 22707; // Balança comercial - saldo mensal (US$ milhões)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarBalancaComercial() {

    console.log(`[BALANÇA ADAPTER] Iniciando sincronização (Série 22707)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1997; // A série começa em 1997
        const anoFim = anoAtual - 1;

        console.log(`[BALANÇA ADAPTER] Buscando Balança Comercial histórica (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const dadosCompletos = [];

        for (const bloco of blocos) {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_BALANCA}/dados?formato=json&dataInicial=01/01/${bloco.inicio}&dataFinal=31/12/${bloco.fim}`;

            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[BALANÇA ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }

            } catch (err) {
                console.warn(`[BALANÇA ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            await sleep(1000);
        }

        if (dadosCompletos.length === 0) return { sucesso: false, slug: 'balanca_comercial' };

        const dadosPorAno = {};
        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, , ano] = item.data.split('/');
                const valor = Number(item.valor);
                if (!isNaN(valor)) {
                    if (!dadosPorAno[ano]) dadosPorAno[ano] = 0;
                    dadosPorAno[ano] += valor;
                }
            }
        });

        // Soma os meses do ano e converte de Milhões para Bilhões (divide por 1000)
        const mapaAnual = {};
        Object.keys(dadosPorAno).forEach(ano => {
            mapaAnual[ano] = Number((dadosPorAno[ano] / 1000).toFixed(2)); 
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'balanca_comercial' },
            {
                titulo: 'Balança Comercial (US$ Bilhões)',
                fonte: 'Banco Central do Brasil (Série 22707)',
                unidade: 'US$',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[BALANÇA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'balanca_comercial' };
    } catch (e) {
        console.error("[BALANÇA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'balanca_comercial' };
    }
}

export { 
    sincronizarBalancaComercial 
};

