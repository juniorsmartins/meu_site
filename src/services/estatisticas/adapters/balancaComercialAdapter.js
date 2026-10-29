import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/indicadorRepository.js'; 

const SERIE_BCB_BALANCA = 22707; // Balança comercial - saldo mensal (US$ milhões)

async function sincronizarBalancaComercial() {

    console.log(`[BALANÇA ADAPTER] Iniciando sincronização (Série 22707)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1997; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_BALANCA}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'balanca_comercial' };
        }

        const dadosPorAno = {};
        res.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, , ano] = item.data.split('/');
                const valor = Number(item.valor);
                if (!isNaN(valor)) {
                    if (!dadosPorAno[ano]) dadosPorAno[ano] = 0;
                    dadosPorAno[ano] += valor;
                }
            }
        });

        const mapaAnual = {};
        Object.keys(dadosPorAno).forEach(ano => {
            mapaAnual[ano] = Number((dadosPorAno[ano] / 1000).toFixed(2)); 
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await indicadorRepository.upsert('balanca_comercial', {
            titulo: 'Balança Comercial (US$ Bilhões)',
            fonte: 'Banco Central do Brasil (Série 22707)',
            unidade: 'US$',
            anos, 
            valores
        });

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

