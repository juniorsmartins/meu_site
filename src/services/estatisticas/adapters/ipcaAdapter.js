import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const SERIE_BCB_IPCA = 433;

async function sincronizarIpca() {
    
    console.log(`[IPCA ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 1995; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'ipca' };
        }

        const dadosPorAno = {};
        res.data.forEach(item => {
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
            const variacoesMensais = dadosPorAno[ano];
            let fatorAcumulado = 1;
            variacoesMensais.forEach(variacao => {
                fatorAcumulado *= (1 + (variacao / 100));
            });
            mapaAnual[ano] = Number(((fatorAcumulado - 1) * 100).toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await indicadorRepository.upsert('ipca', {
            titulo: 'Inflação Oficial - IPCA Acumulado Anual (%)',
            fonte: 'Banco Central / IBGE (Série 433)',
            unidade: '%',
            anos, 
            valores
        });

        console.log(`[IPCA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'ipca' };

    } catch (e) {
        console.error("[IPCA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'ipca' };
    }
}

export { 
    sincronizarIpca 
};

