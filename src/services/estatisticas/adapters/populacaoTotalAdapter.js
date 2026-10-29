import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SIDRA_TABELA = 6579;
const SIDRA_VARIAVEL = 9324;

async function sincronizarPopulacaoTotal() {
    
    console.log(`[POPULAÇÃO ADAPTER] Iniciando sincronização (SIDRA Tabela ${SIDRA_TABELA})...`);

    try {
        const agora = new Date();
        const url = `https://apisidra.ibge.gov.br/values/t/${SIDRA_TABELA}/n1/all/v/${SIDRA_VARIAVEL}/p/all?formato=json`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            console.warn("[POPULAÇÃO ADAPTER] Falha ao obter dados do IBGE SIDRA.");
            return { sucesso: false, slug: 'populacao_total' };
        }

        // O primeiro objeto do array é o cabeçalho das colunas, por isso ignoramos o índice 0
        const registros = res.data.slice(1);

        const mapaAnual = {};
        registros.forEach(item => {
            const ano = item.D3N; // Ex: "2001"
            const valor = Number(item.V);

            if (ano && !isNaN(valor) && valor > 0) {
                // Converte de habitantes para milhões (2 casas decimais)
                mapaAnual[ano] = Number((valor / 1_000_000).toFixed(2));
            }
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        if (anos.length === 0) {
            return { sucesso: false, slug: 'populacao_total' };
        }

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'populacao_total' },
            {
                titulo: 'População Residente Total',
                fonte: 'IBGE - SIDRA (Tabela 6579)',
                unidade: 'Milhões',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[POPULAÇÃO ADAPTER] Sincronizado com sucesso! (${anos.length} anos)`);
        return { sucesso: true, slug: 'populacao_total' };

    } catch (e) {
        console.error("[POPULAÇÃO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'populacao_total' };
    }
}

export { 
    sincronizarPopulacaoTotal 
};

