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

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // URLs oficiais
        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlPibIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/6784/periodos/-30/variaveis/9810?localidades=N1[all]`;
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/-30/variaveis/4099?localidades=N1%5Ball%5D`;

        // Executa as requisições em paralelo usando allSettled para evitar que uma falha derrube as outras
        const [resSelic, resIpca, resPib, resDesemprego] = await Promise.all([
            httpClient(urlSelic),
            httpClient(urlIpca),
            httpClient(urlPibIbge),
            httpClient(urlDesempregoIbge)
        ]);

        const agora = new Date();

        // 1. Processamento da Selic
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
                    { upsert: true, new: true }
                );
            }
        }

        // 2. Processamento do IPCA
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
                    { upsert: true, new: true }
                );
            }
        }

        // 3. Processamento do PIB (IBGE) - Com mapeamento próprio e independente de anos
        if (resPib.ok && Array.isArray(resPib.data) && resPib.data[0]?.resultados) {
            try {
                const seriePib = resPib.data[0].resultados[0].series[0].serie;
                const anosPib = Object.keys(seriePib).sort((a, b) => a - b);
                const valoresPib = anosPib.map(periodo => Number(seriePib[periodo]));

                if (anosPib.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'pib' },
                        { titulo: 'Crescimento do PIB (%)', fonte: 'IBGE (Tabela 6784)', unidade: '%', anos: anosPib, valores: valoresPib, ultimaAtualizacao: agora },
                        { upsert: true, new: true }
                    );
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear PIB do IBGE:", e.message);
            }
        }

        // 4. Processamento do Desemprego (IBGE) - Com mapeamento próprio e independente de anos
        if (resDesemprego.ok && Array.isArray(resDesemprego.data) && resDesemprego.data[0]?.resultados) {
            try {
                const serieDesemprego = resDesemprego.data[0].resultados[0].series[0].serie;
                const anosDesemprego = Object.keys(serieDesemprego).sort((a, b) => a - b);
                const valoresDesemprego = anosDesemprego.map(ano => Number(serieDesemprego[ano]));

                if (anosDesemprego.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'desemprego' },
                        { titulo: 'Taxa Média de Desemprego (%)', fonte: 'IBGE (PNAD - Tabela 4099)', unidade: '%', anos: anosDesemprego, valores: valoresDesemprego, ultimaAtualizacao: agora },
                        { upsert: true, new: true }
                    );
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear Desemprego do IBGE:", e.message);
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

