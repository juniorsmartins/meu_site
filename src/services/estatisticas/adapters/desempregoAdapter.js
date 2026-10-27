import { httpClient } from '../chamadaHttpClient.js';
import { IndicadorAnualModel } from '../../../models/indicadorSchema.js';

const SERIE_BCB_DESEMPREGO = 24369;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarDesemprego() {

    console.log(`[DESEMPREGO ADAPTER] Iniciando sincronização (BCB Série 24369)...`);

    try {
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const anoInicio = 2012; // Início da PNAD Contínua
        const anoFim = anoAtual - 1; // Exclui o ano atual para não ter média parcial

        console.log(`[DESEMPREGO ADAPTER] Buscando dados de ${anoInicio} a ${anoFim}...`);

        // A série é mensal, então fazemos uma única requisição (cerca de 160 pontos)
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_DESEMPREGO}/dados?formato=json&dataInicial=01/01/${anoInicio}&dataFinal=31/12/${anoFim}`;

        const resposta = await httpClient(url);

        if (!resposta.ok || !Array.isArray(resposta.data) || resposta.data.length === 0) {
            console.warn("[DESEMPREGO ADAPTER] Falha ao obter dados do BCB.");
            return { sucesso: false, slug: 'desemprego' };
        }

        // ---------------------------------------------------------------
        // 1. Agrupa os valores mensais por ano
        // ---------------------------------------------------------------
        const dadosPorAno = {};

        resposta.data.forEach(item => {
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
        // 2. Calcula a média aritmética simples de cada ano
        // ---------------------------------------------------------------
        const mapaAnual = {};

        Object.keys(dadosPorAno).forEach(ano => {
            const valoresMensais = dadosPorAno[ano];

            // Opcional: avisar se o ano não tiver os 12 meses (útil para debug)
            if (valoresMensais.length < 12) {
                console.warn(`[DESEMPREGO ADAPTER] Atenção: O ano ${ano} possui apenas ${valoresMensais.length} meses.`);
            }

            const soma = valoresMensais.reduce((acc, val) => acc + val, 0);
            const media = soma / valoresMensais.length;

            // Arredonda para 2 casas decimais
            mapaAnual[ano] = Number(media.toFixed(2));
        });

        const anos = Object.keys(mapaAnual).sort((a, b) => Number(a) - Number(b));
        const valores = anos.map(ano => mapaAnual[ano]);

        if (anos.length === 0) {
            console.warn("[DESEMPREGO ADAPTER] Nenhum dado válido foi processado.");
            return { sucesso: false, slug: 'desemprego' };
        }

        // ---------------------------------------------------------------
        // 3. Salva no MongoDB
        // ---------------------------------------------------------------
        await IndicadorAnualModel.findOneAndUpdate(
            { slug: 'desemprego' },
            {
                titulo: 'Taxa Média de Desemprego (%)',
                fonte: 'Banco Central do Brasil (Série 24369 - PNAD Contínua)',
                unidade: '%',
                anos,
                valores,
                ultimaAtualizacao: agora
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log(`[DESEMPREGO ADAPTER] Sincronizado com sucesso! (${anos.length} anos carregados)`);
        return { sucesso: true, slug: 'desemprego' };

    } catch (e) {
        console.error("[DESEMPREGO ADAPTER] Erro crítico: ", e.message);
        return { sucesso: false, slug: 'desemprego' };
    }
}

export { 
    sincronizarDesemprego 
};

