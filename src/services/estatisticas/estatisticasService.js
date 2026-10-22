import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

// Códigos das Séries Temporais Oficiais no Banco Central do Brasil (SGS)
// 432 = Taxa Selic acumulada / 433 = IPCA (Inflação oficial acumulada)
const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central...");

        const dataInicio = "01/01/2018";
        const dataFim = "31/12/2026";

        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicio}&dataFinal=${dataFim}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicio}&dataFinal=${dataFim}`;

        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(urlSelic),
            fetch(urlIpca)
        ]);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

        // 1. Processamento seguro da Selic com validação de JSON
        if (respostaSelic.ok) {
            const contentType = respostaSelic.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const dadosSelicBrutos = await respostaSelic.json();
                if (Array.isArray(dadosSelicBrutos) && dadosSelicBrutos.length > 0) {
                    const mapaAnualSelic = {};
                    dadosSelicBrutos.forEach(item => {
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
            } else {
                console.warn("[ESTATÍSTICAS SERVICE] A API da Selic não retornou um JSON válido.");
            }
        }

        // 2. Processamento seguro do IPCA com validação de JSON
        if (respostaIpca.ok && anos.length > 0) {
            const contentType = respostaIpca.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const dadosIpcaBrutos = await respostaIpca.json();
                if (Array.isArray(dadosIpcaBrutos)) {
                    const mapaAnualIpca = {};
                    dadosIpcaBrutos.forEach(item => {
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
            } else {
                console.warn("[ESTATÍSTICAS SERVICE] A API do IPCA não retornou um JSON válido.");
            }
        }

        return {
            anos: anos,
            pib: [],
            desemprego: [],
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro crítico ao processar dados externos:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

export { 
    estatisticasService 
};

