import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_RESERVAS = 13621; // Reservas internacionais - conceito liquidez (US$ Bilhões)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarReservas() {
    
    console.log(`[RESERVAS ADAPTER] Iniciando sincronização (Série 13621)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        console.log(`[RESERVAS ADAPTER] Buscando histórico (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const dadosCompletos = [];

        for (const bloco of blocos) {
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_RESERVAS}/dados?formato=json&dataInicial=01/01/${bloco.inicio}&dataFinal=31/12/${bloco.fim}`;
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[RESERVAS ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[RESERVAS ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            await sleep(1000);
        }

        if (dadosCompletos.length === 0) {
            console.warn("[RESERVAS ADAPTER] Nenhum dado retornado.");
            return { sucesso: false, slug: 'reservas' };
        }

        const mapaAnual = {};

        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, mes, ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                if (!isNaN(valor)) {
                    // Armazena o valor de dezembro (fechamento do ano) ou o primeiro disponível
                    if (!mapaAnual[ano] || mes === '12') {
                        mapaAnual[ano] = valor;
                    }
                }
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'reservas' },
            {
                titulo: 'Reservas Internacionais (US$ Bilhões)',
                fonte: 'Banco Central do Brasil (Série 13621)',
                unidade: 'US$',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[RESERVAS ADAPTER] Reservas sincronizadas com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'reservas' };

    } catch (e) {
        console.error("[RESERVAS ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'reservas' };
    }
}

export { 
    sincronizarReservas 
};

