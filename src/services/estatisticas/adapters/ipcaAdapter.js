import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_IPCA = 433;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarIpca() {

    console.log(`[IPCA ADAPTER] Iniciando sincronização do IPCA Acumulado...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();

        const anoInicio = 1995; 
        const anoFim = anoAtual - 1; // Exclui o ano atual para não ter acumulado parcial

        console.log(`[IPCA ADAPTER] Buscando IPCA histórico (${anoInicio} a ${anoFim}) em blocos de 4 anos...`);

        // Cria blocos de 4 em 4 anos
        const blocos = [];
        for (let ano = anoInicio; ano <= anoFim; ano += 4) {
            const fimBloco = Math.min(ano + 3, anoFim);
            blocos.push({ inicio: ano, fim: fimBloco });
        }

        const criarUrl = (inicio, fim) => 
            `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=01/01/${inicio}&dataFinal=31/12/${fim}`;

        const dadosCompletos = [];

        // Busca sequencial com pausa
        for (const bloco of blocos) {
            const url = criarUrl(bloco.inicio, bloco.fim);
            try {
                const res = await httpClient(url);
                if (Array.isArray(res.data)) {
                    dadosCompletos.push(...res.data);
                    console.log(`[IPCA ADAPTER] Bloco ${bloco.inicio}-${bloco.fim} OK (${res.data.length} registros)`);
                }
            } catch (err) {
                console.warn(`[IPCA ADAPTER] Falha no bloco ${bloco.inicio}-${bloco.fim}:`, err.message);
            }
            
            await sleep(3000); 
        }

        if (dadosCompletos.length === 0) {
            console.warn("[IPCA ADAPTER] Nenhum dado retornado do IPCA.");
            return { sucesso: false, slug: 'ipca' };
        }

        // ---------------------------------------------------------------
        // 1. Agrupa as variações mensais por ano
        // ---------------------------------------------------------------
        const dadosPorAno = {};

        dadosCompletos.forEach(item => {
            if (item.data && item.data.includes('/')) {
                const [dia, mes, ano] = item.data.split('/');
                const valor = Number(item.valor);
                
                if (!isNaN(valor)) {
                    if (!dadosPorAno[ano]) dadosPorAno[ano] = [];
                    dadosPorAno[ano].push(valor);
                }
            }
        });

        // ---------------------------------------------------------------
        // 2. Calcula o acumulado do ano usando juros compostos
        // Fórmula: ( (1 + v1/100) * (1 + v2/100) * ... - 1 ) * 100
        // ---------------------------------------------------------------
        const mapaAnual = {};

        Object.keys(dadosPorAno).forEach(ano => {
            const variacoesMensais = dadosPorAno[ano];

            // Opcional: Avisar se o ano não tiver os 12 meses (útil para debug)
            if (variacoesMensais.length < 12) {
                console.warn(`[IPCA ADAPTER] Atenção: O ano ${ano} possui apenas ${variacoesMensais.length} meses de dados.`);
            }
            
            let fatorAcumulado = 1;
            variacoesMensais.forEach(variacao => {
                fatorAcumulado *= (1 + (variacao / 100));
            });

            const acumuladoPercentual = (fatorAcumulado - 1) * 100;
            
            // Arredonda para 2 casas decimais
            mapaAnual[ano] = Number(acumuladoPercentual.toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        // ---------------------------------------------------------------
        // 3. Salva no MongoDB
        // ---------------------------------------------------------------
        if (anos.length > 0) {
            await IndicadorAnualModel.findOneAndUpdate(
                { slug: 'ipca' },
                { 
                    titulo: 'Inflação Oficial - IPCA Acumulado Anual (%)', 
                    fonte: 'Banco Central / IBGE (Série 433 - Acumulado no ano)', 
                    unidade: '%', 
                    anos, 
                    valores, 
                    ultimaAtualizacao: agora 
                },
                { upsert: true, returnDocument: 'after' }
            );

            console.log(`[IPCA ADAPTER] IPCA acumulado (${anos.length} anos) sincronizado com sucesso!`);
            return { sucesso: true, slug: 'ipca' };
        }

        return { sucesso: false, slug: 'ipca' };

    } catch (e) {
        console.error("[IPCA ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'ipca' };
    }
}

export { 
    sincronizarIpca 
};

