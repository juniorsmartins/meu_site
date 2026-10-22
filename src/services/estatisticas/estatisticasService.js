import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

// Códigos das Séries Temporais Oficiais no Banco Central do Brasil (SGS)
// 432 = Taxa Selic acumulada / 433 = IPCA (Inflação oficial acumulada)
const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central...");

        // Usando o endpoint padrão sem parâmetros de data restritivos para testar a resposta pura
        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json`;

        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(urlSelic),
            fetch(urlIpca)
        ]);

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Selic: ${respostaSelic.status}`);
        console.log(`[ESTATÍSTICAS SERVICE] Content-Type Selic: ${respostaSelic.headers.get("content-type")}`);

        // CAPTURA O TEXTO BRUTO PARA INSPECIONAR NO CONSOLE DA VERCEL
        const textoBrutoSelic = await respostaSelic.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido da Selic (primeiros 300 caracteres):`, textoBrutoSelic.substring(0, 1000));

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

        // Tenta converter o texto bruto capturado para JSON de forma segura
        if (respostaSelic.ok && textoBrutoSelic) {
            try {
                const dadosSelicBrutos = JSON.parse(textoBrutoSelic);
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
            } catch (jsonError) {
                console.error("[ESTATÍSTICAS SERVICE] Erro ao fazer parse do JSON da Selic:", jsonError.message);
            }
        }

        // Processamento do IPCA utilizando a mesma lógica segura de texto bruto
        if (respostaIpca.ok && anos.length > 0) {
            const textoBrutoIpca = await respostaIpca.text();
            try {
                const dadosIpcaBrutos = JSON.parse(textoBrutoIpca);
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
            } catch (jsonError) {
                console.error("[ESTATÍSTICAS SERVICE] Erro ao fazer parse do JSON do IPCA:", jsonError.message);
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

