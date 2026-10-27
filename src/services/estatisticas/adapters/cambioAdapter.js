import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_CAMBIO = 3695; // Taxa de câmbio comercial para venda (R$/US$)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarCambio() {
    
    console.log(`[CÂMBIO ADAPTER] Iniciando sincronização (Série 3695)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        console.log(`[CÂMBIO ADAPTER] Buscando histórico (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const dadosCompletos = [];

        for (const bloco of blocos) {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_CAMBIO}/dados?formato=json&dataInicial=01/01/${bloco.inicio}&dataFinal=31/12/${bloco.fim}`;
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[CÂMBIO ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[CÂMBIO ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            await sleep(3000);
        }

        if (dadosCompletos.length === 0) {
            console.warn("[CÂMBIO ADAPTER] Nenhum dado retornado.");
            return { sucesso: false, slug: 'cambio' };
        }

        // Agrupa por ano
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

        // Calcula a média de cada ano
        const mapaAnual = {};
        Object.keys(dadosPorAno).forEach(ano => {
            const valoresDiarios = dadosPorAno[ano];
            const soma = valoresDiarios.reduce((acc, val) => acc + val, 0);
            const media = soma / valoresDiarios.length;
            mapaAnual[ano] = Number(media.toFixed(4)); // 4 casas para precisão cambial
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'cambio' },
            {
                titulo: 'Taxa de Câmbio Média Anual (R$/US$)',
                fonte: 'Banco Central do Brasil (Série 3695)',
                unidade: 'R$',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[CÂMBIO ADAPTER] Câmbio sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'cambio' };

    } catch (e) {
        console.error("[CÂMBIO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'cambio' };
    }
}

export { 
    sincronizarCambio 
};

