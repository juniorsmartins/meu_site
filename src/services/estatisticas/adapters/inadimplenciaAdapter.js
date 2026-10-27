import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_INADIMPLENCIA = 21082; // Inadimplência da carteira de crédito - Total (%)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarInadimplencia() {
    
    console.log(`[INADIMPLÊNCIA ADAPTER] Iniciando sincronização (Série 21082)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        // A série 21082 começa em março de 2011
        const anoInicio = 2011; 
        const anoFim = anoAtual - 1;

        console.log(`[INADIMPLÊNCIA ADAPTER] Buscando histórico (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const dadosCompletos = [];

        for (const bloco of blocos) {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_INADIMPLENCIA}/dados?formato=json&dataInicial=01/01/${bloco.inicio}&dataFinal=31/12/${bloco.fim}`;
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[INADIMPLÊNCIA ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[INADIMPLÊNCIA ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            await sleep(3000);
        }

        if (dadosCompletos.length === 0) {
            console.warn("[INADIMPLÊNCIA ADAPTER] Nenhum dado retornado.");
            return { sucesso: false, slug: 'inadimplencia' };
        }

        const dadosPorAno = {};

        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, , ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                if (!isNaN(valor)) {
                    if (!dadosPorAno[ano]) dadosPorAno[ano] = [];
                    dadosPorAno[ano].push(valor);
                }
            }
        });

        const mapaAnual = {};
        Object.keys(dadosPorAno).forEach(ano => {
            const valoresMensais = dadosPorAno[ano];
            const soma = valoresMensais.reduce((acc, val) => acc + val, 0);
            const media = soma / valoresMensais.length;
            mapaAnual[ano] = Number(media.toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'inadimplencia' },
            {
                titulo: 'Taxa Média de Inadimplência (%)',
                fonte: 'Banco Central do Brasil (Série 21082)',
                unidade: '%',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[INADIMPLÊNCIA ADAPTER] Inadimplência sincronizada com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'inadimplencia' };

    } catch (e) {
        console.error("[INADIMPLÊNCIA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'inadimplencia' };
    }
}

export { 
    sincronizarInadimplencia 
};

