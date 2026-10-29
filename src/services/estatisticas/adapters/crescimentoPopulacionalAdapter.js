import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SIDRA_TABELA = 6579;
const SIDRA_VARIAVEL = 9324;

async function sincronizarCrescimentoPopulacional() {
    
    console.log(`[CRESCIMENTO POP ADAPTER] Iniciando sincronização...`);

    try {
        const agora = new Date();
        const url = `https://apisidra.ibge.gov.br/values/t/${SIDRA_TABELA}/n1/all/v/${SIDRA_VARIAVEL}/p/all?formato=json`;

        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length < 2) {
            return { sucesso: false, slug: 'crescimento_populacional' };
        }

        const registros = res.data.slice(1);
        const mapaPopulacao = {};

        registros.forEach(item => {
            const ano = item.D3N;
            const valor = Number(item.V);
            if (ano && !isNaN(valor) && valor > 0) {
                mapaPopulacao[ano] = valor;
            }
        });

        const anosDisponiveis = Object.keys(mapaPopulacao).sort((a, b) => Number(a) - Number(b));
        
        const anosFinais = [];
        const valoresFinais = [];

        // Calcula a variação percentual ano a ano
        for (let i = 1; i < anosDisponiveis.length; i++) {
            const anoAtualStr = anosDisponiveis[i];
            const anoAnteriorStr = anosDisponiveis[i - 1];

            const popAtual = mapaPopulacao[anoAtualStr];
            const popAnterior = mapaPopulacao[anoAnteriorStr];

            if (popAnterior > 0) {
                const taxa = ((popAtual / popAnterior) - 1) * 100;
                anosFinais.push(anoAtualStr);
                valoresFinais.push(Number(taxa.toFixed(2)));
            }
        }

        if (anosFinais.length === 0) {
            return { sucesso: false, slug: 'crescimento_populacional' };
        }

        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'crescimento_populacional' },
            {
                titulo: 'Taxa de Crescimento Populacional (%)',
                fonte: 'IBGE - SIDRA (Tabela 6579)',
                unidade: '%',
                anos: anosFinais,
                valores: valoresFinais,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[CRESCIMENTO POP ADAPTER] Sincronizado com sucesso! (${anosFinais.length} anos)`);
        return { sucesso: true, slug: 'crescimento_populacional' };

    } catch (e) {
        console.error("[CRESCIMENTO POP ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'crescimento_populacional' };
    }
}

export { 
    sincronizarCrescimentoPopulacional 
};

