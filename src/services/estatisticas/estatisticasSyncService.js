import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { httpClient } from './chamadaExternaHttp.js';
import { regraAutorizarApenasAdmin } from '../../helpers/usuarioUtils.js';

const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

function formatarDataBCB(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); 
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const estatisticasSyncService = async (usuarioAutenticado) => {

    regraAutorizarApenasAdmin(usuarioAutenticado);

    try {
        console.log("[SYNC ESTATÍSTICAS] Iniciando sincronização com APIs oficiais (IBGE e BCB)...");

        const dataHoje = new Date();
        const dataFimStr = formatarDataBCB(dataHoje);
                
        const dataInicio = new Date();
        dataInicio.setFullYear(dataHoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // URLs oficiais
        const urlPibIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/6784/periodos/-30/variaveis/9810?localidades=N1[all]`;
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/-30/variaveis/4099?localidades=N1%5Ball%5D`;
        const urlSelicBc = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpcaBc = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;

        // Executa as requisições em paralelo usando allSettled para evitar que uma falha derrube as outras
        const [resPib, resDesemprego, resSelic, resIpca] = await Promise.all([
            httpClient(urlPibIbge),
            httpClient(urlDesempregoIbge),
            httpClient(urlSelicBc),
            httpClient(urlIpcaBc)
        ]);

        const agora = new Date();

        // 1. Processamento do PIB (IBGE) - Com mapeamento próprio e independente de anos
        if (resPib?.ok && Array.isArray(resPib.data) && resPib.data[0]?.resultados?.length) {
            try {
                const seriePib = resPib.data[0].resultados[0]?.series?.[0]?.serie; // Objeto com os anos como chaves e os valores do PIB como valores
                const anosPib = Object.keys(seriePib).sort((a, b) => a - b); // Ordena os anos em ordem crescente - do mais antigo para o mais recente
                const valoresPib = anosPib.map(periodo => Number(seriePib[periodo])); // Converte os valores para números - garantindo consistência no tipo de dado armazenado

                if (anosPib.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'pib' },
                        { titulo: 'Crescimento do PIB (%)', fonte: 'IBGE (Agregado 9810)', unidade: '%', anos: anosPib, valores: valoresPib, ultimaAtualizacao: agora },
                        { upsert: true, returnDocument: 'after' }
                    );
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear PIB do IBGE:", e.message);
            }
        }

        // 2. Processamento do Desemprego (IBGE) - Com mapeamento próprio e independente de anos
        if (resDesemprego.ok && Array.isArray(resDesemprego.data) && resDesemprego.data[0]?.resultados) {
            try {
                const serieDesemprego = resDesemprego.data[0].resultados[0].series[0].serie;
                const anosDesemprego = Object.keys(serieDesemprego).sort((a, b) => a - b);
                const valoresDesemprego = anosDesemprego.map(ano => Number(serieDesemprego[ano]));

                if (anosDesemprego.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'desemprego' },
                        { titulo: 'Taxa Média de Desemprego (%)', fonte: 'IBGE (PNAD - Tabela 4099)', unidade: '%', anos: anosDesemprego, valores: valoresDesemprego, ultimaAtualizacao: agora },
                        { upsert: true, returnDocument: 'after' }
                    );
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear Desemprego do IBGE:", e.message);
            }
        }

        // 3. Processamento da Selic (BCB)
        if (resSelic.ok && Array.isArray(resSelic.data)) {
            const mapaAnualSelic = {};
            resSelic.data.forEach(item => {
                if (item.data && item.data.includes('/')) {
                    const partes = item.data.split('/');
                    const ano = partes[2];
                    const mes = partes[1];
                    if (mes === '12' || !mapaAnualSelic[ano]) {
                        mapaAnualSelic[ano] = Number(item.valor);
                    }
                }
            });
            const anosSelic = Object.keys(mapaAnualSelic).sort((a, b) => a - b);
            const valoresSelic = anosSelic.map(ano => mapaAnualSelic[ano]);

            if (anosSelic.length > 0) {
                await IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'selic' },
                    { titulo: 'Taxa Básica de Juros - Selic (%)', fonte: 'Banco Central (Série 432)', unidade: '%', anos: anosSelic, valores: valoresSelic, ultimaAtualizacao: agora },
                    { upsert: true, returnDocument: 'after' }
                );
            }
        }

        // 4. Processamento do IPCA (BCB)
        if (resIpca.ok && Array.isArray(resIpca.data)) {
            const mapaAnualIpca = {};
            resIpca.data.forEach(item => {
                if (item.data && item.data.includes('/')) {
                    const partes = item.data.split('/');
                    const ano = partes[2];
                    const mes = partes[1];
                    if (mes === '12' || !mapaAnualIpca[ano]) {
                        mapaAnualIpca[ano] = Number(item.valor);
                    }
                }
            });
            const anosIpca = Object.keys(mapaAnualIpca).sort((a, b) => a - b);
            const valoresIpca = anosIpca.map(ano => mapaAnualIpca[ano]);

            if (anosIpca.length > 0) {
                await IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'ipca' },
                    { titulo: 'Inflação Oficial - IPCA (%)', fonte: 'Banco Central / IBGE (Série 433)', unidade: '%', anos: anosIpca, valores: valoresIpca, ultimaAtualizacao: agora },
                    { upsert: true, returnDocument: 'after' }
                );
            }
        }

        return { sucesso: true, mensagem: "Estatísticas sincronizadas com sucesso!" };

    } catch (error) {
        console.error("[SYNC ESTATÍSTICAS] Erro crítico na sincronização:", error);
        throw error;
    }
};

export { 
    estatisticasSyncService 
};

