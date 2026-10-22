import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';
import { httpClient } from './requisicaoEstatistica.js'; // Importa o cliente genérico

const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

function formatarDataBCB(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const estatisticasService = async () => {
    try {
        console.log("[ESTATÍSTICAS SERVICE] Iniciando processamento de todos os indicadores macroeconômicos...");

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // 1. URLs das 4 fontes oficiais (Banco Central e IBGE)
        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        
        // PIB (Contas Nacionais Trimestrais - Tabela 1846 / Variação acumulada em quatro trimestres)
        const urlPibIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/1846/periodos/201601-202404/variaveis/585?localidades=N1[all]`;
        
        // Desemprego (PNAD Contínua - Tabela 4099 que já comprovou funcionamento)
        // const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/201601-202412/variaveis/4099?localidades=N1[all]`;
        // URL corrigida para o Desemprego utilizando o parâmetro 'last' suportado pelo SIDRA do IBGE
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/last/40/variaveis/4099?localidades=N1[all]`;

        // Executa as 4 requisições em paralelo garantindo transparência via httpClient
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

        // 3. Processamento do PIB (IBGE)
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
                console.error("[ESTATÍSTICAS SERVICE] Erro ao mapear PIB do IBGE:", e.message);
            }
        }

        // 4. Processamento da Taxa de Desemprego (IBGE)
        if (resDesemprego.ok && Array.isArray(resDesemprego.data) && resDesemprego.data[0]?.resultados) {
            try {
                const serieDesemprego = resDesemprego.data[0].resultados[0].series[0].serie;
                const mapaDesemprego = {};
                Object.keys(serieDesemprego).forEach(periodo => {
                    const anoChave = periodo.substring(0, 4);
                    mapaDesemprego[anoChave] = Number(serieDesemprego[periodo]);
                });
                desempregoAnual = anos.map(ano => mapaDesemprego[ano] !== undefined ? mapaDesemprego[ano] : null);
            } catch (e) {
                console.error("[ESTATÍSTICAS SERVICE] Erro ao mapear Desemprego do IBGE:", e.message);
            }
        }

        return {
            anos: anos,
            pib: pibAnual,
            desemprego: desempregoAnual,
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro crítico ao processar indicadores:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

export { 
    estatisticasService 
};

