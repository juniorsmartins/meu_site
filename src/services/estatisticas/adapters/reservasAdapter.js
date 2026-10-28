import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_RESERVAS = 13621;

async function sincronizarReservas() {
    
    console.log(`[RESERVAS ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_RESERVAS}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'reservas' };
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

        console.log(`[RESERVAS ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'reservas' };

    } catch (e) {
        console.error("[RESERVAS ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'reservas' };
    }
}

export { 
    sincronizarReservas 
};

