import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

/**
 * Formata uma data no padrão dd/mm/aaaa exigido pela API do Banco Central
 */
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
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central...");

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 8);
        const dataInicioStr = formatarDataBCB(dataInicio);

        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;

        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(urlSelic),
            fetch(urlIpca)
        ]);

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Selic: ${respostaSelic.status}`);
        
        // CAPTURA E EXIBE O TEXTO BRUTO DIRETAMENTE NO CONSOLE NOVAMENTE
        const textoBrutoSelic = await respostaSelic.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido da Selic:`, textoBrutoSelic);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

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
            } catch (e) {
                console.error("[ESTATÍSTICAS SERVICE] Erro ao parsear JSON da Selic:", e.message);
            }
        }

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
            } catch (e) {
                console.error("[ESTATÍSTICAS SERVICE] Erro ao parsear JSON do IPCA:", e.message);
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

