import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central e IBGE...");

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        
        // Endpoints simplificados do IBGE SIDRA
        const urlPibIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/5938/periodos/2016-2026/variaveis/6561?localidades=N1[all]`;
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/2016-2026/variaveis/4099?localidades=N1[all]`;

        const [respostaSelic, respostaIpca, respostaPib, respostaDesemprego] = await Promise.all([
            fetch(urlSelic).catch(() => null),
            fetch(urlIpca).catch(() => null),
            fetch(urlPibIbge).catch(() => null),
            fetch(urlDesempregoIbge).catch(() => null)
        ]);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

        // 1. Processamento e Logs da Selic (Lendo o body apenas uma vez)
        if (respostaSelic) {
            console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Selic: ${respostaSelic.status}`);
            const textoBrutoSelic = await respostaSelic.text();
            console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido da Selic:`, textoBrutoSelic.substring(0, 1000));

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
        }

        // 2. Processamento e Logs do IPCA
        if (respostaIpca) {
            console.log(`[ESTATÍSTICAS SERVICE] Status Resposta IPCA: ${respostaIpca.status}`);
            const textoBrutoIpca = await respostaIpca.text();
            console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do IPCA:`, textoBrutoIpca.substring(0, 1000));

            if (respostaIpca.ok && anos.length > 0 && textoBrutoIpca) {
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
        }

        // 3. Logs e Tratamento Seguro do PIB (IBGE)
        if (respostaPib) {
            console.log(`[ESTATÍSTICAS SERVICE] Status Resposta PIB: ${respostaPib.status}`);
            const textoBrutoPib = await respostaPib.text();
            console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do PIB:`, textoBrutoPib.substring(0, 1000));
        } else {
            console.log(`[ESTATÍSTICAS SERVICE] Resposta PIB indisponível.`);
        }

        // 4. Logs e Tratamento Seguro do Desemprego (IBGE)
        if (respostaDesemprego) {
            console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Desemprego: ${respostaDesemprego.status}`);
            const textoBrutoDesemprego = await respostaDesemprego.text();
            console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do Desemprego:`, textoBrutoDesemprego.substring(0, 1000));
        } else {
            console.log(`[ESTATÍSTICAS SERVICE] Resposta Desemprego indisponível.`);
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

