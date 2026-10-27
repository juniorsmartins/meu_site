import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

// Código 7326 = PIB - Taxa de variação real no ano
const SERIE_BCB_PIB = 7326;

async function sincronizarPib() {

    console.log(`[PIB ADAPTER] Iniciando sincronização do PIB (Banco Central)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        
        // Início em 1995 para alinhar com o gráfico do IPCA (Plano Real)
        const anoInicio = 1995;
        const anoFim = anoAtual - 1; // Exclui o ano atual para não ter acumulado parcial

        // O BCB permite puxar toda a série anual de uma vez, sem precisar de blocos
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_PIB}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;


        console.log(`[PIB ADAPTER] Buscando dados no BCB (Série ${SERIE_BCB_PIB})...`);
        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data)) {
            console.warn("[PIB ADAPTER] Falha ao obter dados do PIB no BCB.");
            return { sucesso: false, slug: 'pib' };
        }

        const pares = resposta.data.map(item => {
            // O BCB retorna a data no formato "DD/MM/YYYY". Pegamos só o ano.
            const ano = (item.data && item.data.includes('/')) ? item.data.split('/')[2] : null;
            
            // O Number() transforma vazio ou texto em NaN. Number.isFinite garante que é um número válido.
            const valorNumerico = Number(item.valor);
            const valor = Number.isFinite(valorNumerico) ? valorNumerico : null;
            
            return { ano, valor };
        })
        .filter(item => item.ano !== null); // Remove itens sem ano válido

        pares.sort((a, b) => Number(a.ano) - Number(b.ano));

        if (pares.length === 0) {
            console.warn("[PIB ADAPTER] Nenhum dado válido do PIB foi encontrado.");
            return { sucesso: false, slug: 'pib' };
        }

        const anos = pares.map(item => item.ano);
        const valores = pares.map(item => item.valor);

        // ---------------------------------------------------------------
        // Salva no MongoDB
        // ---------------------------------------------------------------
        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'pib' },
            { 
                titulo: 'Crescimento do PIB Anual (%)', 
                fonte: 'Banco Central do Brasil (Série 7326)', 
                unidade: '%', 
                anos, 
                valores, 
                ultimaAtualizacao: agora 
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[PIB ADAPTER] PIB sincronizado com sucesso! (${anos.length} anos carregados)`);
        return { sucesso: true, slug: 'pib' };

    } catch (e) {
        console.error("[PIB ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'pib' };
    }
}

export { 
    sincronizarPib 
};

