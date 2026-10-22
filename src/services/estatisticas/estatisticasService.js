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
        console.log("[ESTATÍSTICAS SERVICE] Iniciando processamento de indicadores...");

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // URLs consolidadas e estáveis do Banco Central e do IBGE (Desemprego)
        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/201601-202412/variaveis/4099?localidades=N1[all]`;

        const [resSelic, resIpca, resDesemprego] = await Promise.all([
            httpClient(urlSelic),
            httpClient(urlIpca),
            httpClient(urlDesempregoIbge)
        ]);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];
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

        // 3. Processamento da Taxa de Desemprego (IBGE)
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
                console.error("[ESTATÍSTICAS SERVICE] Erro ao mapear Desemprego:", e.message);
            }
        }

        return {
            anos: anos,
            pib: [],
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

