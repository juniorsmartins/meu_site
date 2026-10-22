import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

// Códigos das Séries Temporais Oficiais no Banco Central do Brasil (SGS)
// 432 = Taxa Selic acumulada / 433 = IPCA (Inflação oficial acumulada)
const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        // 1. Requisições paralelas para as APIs do Banco Central
        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json`),
            fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json`)
        ]);

        let selicAnual = [6.50, 4.50, 2.00, 9.25, 13.75, 11.75, 10.50, 11.25];
        let ipcaAnual = [3.75, 4.31, 4.52, 10.06, 5.79, 4.62, 4.15, 3.90];
        const anosHistoricos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

        // 2. Blindagem: Valida se a resposta do Banco Central é um Array antes de usar .find()
        if (respostaSelic.ok) {
            const dadosSelicBrutos = await respostaSelic.json();
            if (Array.isArray(dadosSelicBrutos)) {
                selicAnual = anosHistoricos.map(ano => {
                    const registro = dadosSelicBrutos.find(d => d.data && (d.data.endsWith(`${ano}`) || d.data.includes(`/${ano}`)));
                    return registro ? Number(registro.valor) : selicAnual[anosHistoricos.indexOf(ano)];
                });
            }
        }

        if (respostaIpca.ok) {
            const dadosIpcaBrutos = await respostaIpca.json();
            if (Array.isArray(dadosIpcaBrutos)) {
                ipcaAnual = anosHistoricos.map(ano => {
                    const registro = dadosIpcaBrutos.find(d => d.data && (d.data.endsWith(`${ano}`) || d.data.includes(`/${ano}`)));
                    return registro ? Number(registro.valor) : ipcaAnual[anosHistoricos.indexOf(ano)];
                });
            }
        }

        // Dados estruturados oficiais consolidados para PIB e Desemprego
        const pibAnual = [1.8, 1.2, -3.3, 5.0, 3.0, 2.9, 2.5, 2.2];
        const desempregoAnual = [12.3, 11.9, 13.5, 13.2, 9.6, 7.8, 7.1, 6.8];

        return {
            anos: anosHistoricos,
            pib: pibAnual,
            desemprego: desempregoAnual,
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("Erro no serviço de estatísticas:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

export { 
    estatisticasService 
};

