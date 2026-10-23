import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { httpClient } from './chamadaExternaHttp.js';
import { regraAutorizarAdmin } from '../../helpers/usuarioUtils.js';

const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

function formatarDataBCB(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const estatisticasSyncService = async (usuarioAutenticado) => {

    regraAutorizarAdmin(usuarioAutenticado);

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
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/-36/variaveis/4099?localidades=N1%5Ball%5D`;

        // Executa as requisições em paralelo
        const [resSelic, resIpca, resPib, resDesemprego] = await Promise.all([
            httpClient(urlSelic),
            httpClient(urlIpca),
            httpClient(urlPibIbge),
            httpClient(urlDesempregoIbge)
        ]);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];
        let pibAnual = [];
        let desempregoAnual = [];

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
            anos = Object.keys(mapaAnualSelic).sort((a, b) => a - b);
            selicAnual = anos.map(ano => mapaAnualSelic[ano]);
        }

        // 2. Processamento do IPCA
        if (resIpca.ok && Array.isArray(resIpca.data) && anos.length > 0) {
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
            ipcaAnual = anos.map(ano => mapaAnualIpca[ano] !== undefined ? mapaAnualIpca[ano] : null);
        }

        // 3. Processamento do PIB
        if (resPib.ok && Array.isArray(resPib.data) && resPib.data[0]?.resultados) {
            try {
                const seriePib = resPib.data[0].resultados[0].series[0].serie;
                const mapaPib = {};
                Object.keys(seriePib).forEach(periodo => {
                    const anoChave = periodo.substring(0, 4);
                    mapaPib[anoChave] = Number(seriePib[periodo]);
                });
                pibAnual = anos.map(ano => mapaPib[ano] !== undefined ? mapaPib[ano] : null);
            } catch (e) {
                console.error("[SYNC] Erro ao mapear PIB:", e.message);
            }
        }

        // 4. Processamento do Desemprego
        if (resDesemprego.ok && Array.isArray(resDesemprego.data) && resDesemprego.data[0]?.resultados) {
            try {
                const serieDesemprego = resDesemprego.data[0].resultados[0].series[0].serie;
                desempregoAnual = anos.map(ano => {
                    const valor = serieDesemprego[ano];
                    return valor !== undefined ? Number(valor) : null;
                });
            } catch (e) {
                console.error("[SYNC] Erro ao mapear Desemprego:", e.message);
            }
        }

        // Se obtivemos anos válidos, salvamos/atualizamos no MongoDB
        if (anos.length > 0) {
            const agora = new Date();

            await Promise.all([
                IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'pib' },
                    { titulo: 'Crescimento do PIB (%)', fonte: 'IBGE (Tabela 6784)', unidade: '%', anos, valores: pibAnual, ultimaAtualizacao: agora },
                    { upsert: true, new: true }
                ),
                IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'desemprego' },
                    { titulo: 'Taxa Média de Desemprego (%)', fonte: 'IBGE (PNAD - Tabela 4099)', unidade: '%', anos, valores: desempregoAnual, ultimaAtualizacao: agora },
                    { upsert: true, new: true }
                ),
                IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'ipca' },
                    { titulo: 'Inflação Oficial - IPCA (%)', fonte: 'Banco Central / IBGE (Série 433)', unidade: '%', anos, valores: ipcaAnual, ultimaAtualizacao: agora },
                    { upsert: true, new: true }
                ),
                IndicadorAnualModel.findOneAndUpdate(
                    { slug: 'selic' },
                    { titulo: 'Taxa Básica de Juros - Selic (%)', fonte: 'Banco Central (Série 432)', unidade: '%', anos, valores: selicAnual, ultimaAtualizacao: agora },
                    { upsert: true, new: true }
                )
            ]);
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

