import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_POPULACAO = 21774; // População (Unidades: milhares)

async function sincronizarPopulacao() {
    
    console.log(`[POPULAÇÃO ADAPTER] Iniciando sincronização (Série ${SERIE_BCB_POPULACAO})...`);

    try {
        const agora = new Date();
        // Puxa toda a série de uma vez
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_POPULACAO}/dados?formato=json`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            console.warn("[POPULAÇÃO ADAPTER] Falha ao obter dados da série 21774.");
            return { sucesso: false, slug: 'populacao_total' };
        }

        // 1. Processar População Total (em Milhões)
        const anosPop = [];
        const valoresPop = [];
        
        // 2. Processar Taxa de Crescimento (%)
        const anosCresc = [];
        const valoresCresc = [];

        // Ordena os dados por data para garantir o cálculo correto da taxa
        const dadosOrdenados = res.data
            .filter(item => item.data && item.data.includes('/'))
            .map(item => {
                const [dia, mes, ano] = item.data.split('/');
                return {
                    ano: ano,
                    // A série vem em milhares. Dividimos por 1000 para obter milhões.
                    valorMilhoes: Number(item.valor) / 1000 
                };
            })
            .sort((a, b) => Number(a.ano) - Number(b.ano));

        for (let i = 0; i < dadosOrdenados.length; i++) {
            const atual = dadosOrdenados[i];
            
            // Popula Total
            anosPop.push(atual.ano);
            valoresPop.push(Number(atual.valorMilhoes.toFixed(2)));

            // Taxa de Crescimento (a partir do segundo ano)
            if (i > 0) {
                const anterior = dadosOrdenados[i - 1];
                // Como a série é anual e contínua, a diferença é sempre 1 ano
                const taxa = ((atual.valorMilhoes / anterior.valorMilhoes) - 1) * 100;
                anosCresc.push(atual.ano);
                valoresCresc.push(Number(taxa.toFixed(2)));
            }
        }

        // --- Salvando População Total no MongoDB ---
        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'populacao_total' },
            {
                titulo: 'População Residente Total',
                fonte: 'Banco Central do Brasil (Série 21774 - Base IBGE)',
                unidade: 'Milhões',
                anos: anosPop,
                valores: valoresPop,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );
        console.log(`[POPULAÇÃO ADAPTER] População Total salva (${anosPop.length} anos).`);

        // --- Salvando Taxa de Crescimento no MongoDB ---
        if (anosCresc.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'crescimento_populacional' },
                {
                    titulo: 'Taxa de Crescimento Populacional (%)',
                    fonte: 'Banco Central do Brasil (Série 21774 - Base IBGE)',
                    unidade: '%',
                    anos: anosCresc,
                    valores: valoresCresc,
                    ultimaAtualizacao: agora
                },
                { upsert: true, returnDocument: 'after' }
            );
            console.log(`[POPULAÇÃO ADAPTER] Taxa de Crescimento salva (${anosCresc.length} anos).`);
        }

        return { sucesso: true, slug: 'populacao_total' };

    } catch (e) {
        console.error("[POPULAÇÃO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'populacao_total' };
    }
}

export { 
    sincronizarPopulacao 
};

