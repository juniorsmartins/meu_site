import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

// Códigos das Séries Temporais Oficiais no Banco Central do Brasil (SGS)
// 432 = Taxa Selic acumulada / 433 = IPCA (Inflação oficial acumulada)
const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central...");

        // Definimos um intervalo seguro de datas para atender aos requisitos da API do BCB
        const dataInicio = "01/01/2000";
        const dataFim = "31/12/2026";

        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicio}&dataFinal=${dataFim}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicio}&dataFinal=${dataFim}`;

        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(urlSelic),
            fetch(urlIpca)
        ]);

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Selic: ${respostaSelic.status}`);
        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta IPCA: ${respostaIpca.status}`);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

        if (respostaSelic.ok) {
            const dadosSelicBrutos = await respostaSelic.json();
            console.log(`[ESTATÍSTICAS SERVICE] Total de registros da Selic recebidos:`, Array.isArray(dadosSelicBrutos) ? dadosSelicBrutos.length : 'Não é array');

            if (Array.isArray(dadosSelicBrutos) && dadosSelicBrutos.length > 0) {
                const mapaAnualSelic = {};
                dadosSelicBrutos.forEach(item => {
                    if (item.data && item.data.includes('/')) {
                        const partes = item.data.split('/');
                        const ano = partes[2];
                        const mes = partes[1];
                        
                        // Pega o valor de dezembro ou o último disponível no ano
                        if (mes === '12' || !mapaAnualSelic[ano]) {
                            mapaAnualSelic[ano] = Number(item.valor);
                        }
                    }
                });

                anos = Object.keys(mapaAnualSelic).sort((a, b) => a - b);
                selicAnual = anos.map(ano => mapaAnualSelic[ano]);
            }
        }

        if (respostaIpca.ok && anos.length > 0) {
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
        }

        return {
            anos: anos,
            pib: [],
            desemprego: [],
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("[ESTATÍSTICAS SERVICE] Erro crítico ao buscar dados:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};
export { 
    estatisticasService 
};

