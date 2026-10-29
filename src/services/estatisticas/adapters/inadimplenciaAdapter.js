import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

const SERIE_BCB_INADIMPLENCIA = 21082;

async function sincronizarInadimplencia() {
    
    console.log(`[INADIMPLÊNCIA ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2011; 
        const anoFim = anoAtual - 1;

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_INADIMPLENCIA}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            return { sucesso: false, slug: 'inadimplencia' };
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
            const valoresMensais = dadosPorAno[ano];
            const soma = valoresMensais.reduce((acc, val) => acc + val, 0);
            mapaAnual[ano] = Number((soma / valoresMensais.length).toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        await indicadorRepository.upsert('inadimplencia', {
            titulo: 'Taxa Média de Inadimplência (%)',
            fonte: 'Banco Central do Brasil (Série 21082)',
            unidade: '%',
            anos, 
            valores
        });

        console.log(`[INADIMPLÊNCIA ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'inadimplencia' };

    } catch (e) {
        console.error("[INADIMPLÊNCIA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'inadimplencia' };
    }
}

export { 
    sincronizarInadimplencia 
};

