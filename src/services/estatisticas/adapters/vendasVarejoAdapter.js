import { httpClient } from '../chamadaHttpClient.js';
import { indicadorRepository } from '../../../repositories/estatisticas/indicadorRepository.js';

// Mudamos para a Série 1455 (Índice de Volume de Vendas - Base 100)
const SERIE_BCB_VAREJO = 1455; 

async function sincronizarVendasVarejo() {
    console.log(`[VAREJO ADAPTER] Iniciando sincronização (Série 1455)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2000; 
        const anoFim = anoAtual - 1;

        // Busca todos os anos de uma vez (série mensal)
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_VAREJO}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;
        
        const res = await httpClient(url);

        if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
            console.warn("[VAREJO ADAPTER] Falha ao obter dados.");
            return { sucesso: false, slug: 'vendas_varejo' };
        }

        // Agrupa apenas o valor de DEZEMBRO de cada ano (fechamento)
        const dadosDezembro = {};
        res.data.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [, mes, ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                // Só guarda se for dezembro e for um número válido
                if (mes === '12' && !isNaN(valor)) {
                    dadosDezembro[ano] = valor;
                }
            }
        });

        const anosDisponiveis = Object.keys(dadosDezembro).sort((a, b) => Number(a) - Number(b));
        
        const anosFinais = [];
        const valoresFinais = [];

        // Calcula a variação percentual ano a ano comparando os meses de dezembro
        for (let i = 1; i < anosDisponiveis.length; i++) {
            const anoAtualStr = anosDisponiveis[i];
            const anoAnteriorStr = anosDisponiveis[i - 1];

            const valorAtual = dadosDezembro[anoAtualStr];
            const valorAnterior = dadosDezembro[anoAnteriorStr];

            // Fórmula da variação: ((Atual / Anterior) - 1) * 100
            const variacao = ((valorAtual / valorAnterior) - 1) * 100;

            anosFinais.push(anoAtualStr);
            valoresFinais.push(Number(variacao.toFixed(2)));
        }

        await indicadorRepository.upsert('vendas_varejo', {
            titulo: 'Vendas no Varejo (%)',
            fonte: 'Banco Central do Brasil (Série 1455)',
            unidade: '%',
            anos: anosFinais, 
            valores: valoresFinais
        });

        console.log(`[VAREJO ADAPTER] Sincronizado com sucesso! (${anosFinais.length} anos)`);
        return { sucesso: true, slug: 'vendas_varejo' };

    } catch (e) {
        console.error("[VAREJO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'vendas_varejo' };
    }
}

export { 
    sincronizarVendasVarejo 
};

