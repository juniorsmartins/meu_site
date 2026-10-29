import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const SERIE_BCB_RESERVAS = 13621; // Série diária

async function sincronizarReservas() {
    
    console.log(`[RESERVAS ADAPTER] Iniciando sincronização (Série 13621 - Diária)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        // A API do BCB limita séries diárias a 10 anos por consulta.
        // Vamos fatiar em blocos de 10 anos.
        const dadosCompletos = [];

        for (let ano = anoInicio; ano <= anoFim; ano += 10) {
            const fimBloco = Math.min(ano + 9, anoFim);
            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_RESERVAS}/dados?formato=json&dataInicial=01/01/${ano}&dataFinal=31/12/${fimBloco}`;
            
            console.log(`[RESERVAS ADAPTER] Buscando bloco ${ano}-${fimBloco}...`);
            const res = await httpClient(url);

            if (res.ok && Array.isArray(res.data)) {
                dadosCompletos.push(...res.data);
            } else {
                console.warn(`[RESERVAS ADAPTER] Falha no bloco ${ano}-${fimBloco}`);
            }
        }

        if (dadosCompletos.length === 0) {
            return { sucesso: false, slug: 'reservas' };
        }

        const mapaAnual = {};
        dadosCompletos.forEach(item => {
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

        await indicadorRepository.upsert('reservas', {
            titulo: 'Reservas Internacionais (US$ Bilhões)',
            fonte: 'Banco Central do Brasil (Série 13621)',
            unidade: 'US$',
            anos, 
            valores
        });

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

