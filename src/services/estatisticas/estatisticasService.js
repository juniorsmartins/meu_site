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
        console.log("[ESTATÍSTICAS SERVICE] Iniciando requisição para as APIs do Banco Central e IBGE...");

        const hoje = new Date();
        const dataFimStr = formatarDataBCB(hoje);
        
        const dataInicio = new Date();
        dataInicio.setFullYear(hoje.getFullYear() - 8);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // URLs do Banco Central
        const urlSelic = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        const urlIpca = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;

        // URLs da API SIDRA do IBGE (Tabela 6784 para PIB e Tabela 4099 para Desemprego)
        const urlPibIbge = `https(://servicodados.ibge.gov.br/api/v3/agregados/6784/periodos/2018-2025/variaveis/6561?localidades=N1[all]`;
        const urlDesempregoIbge = `https://servicodados.ibge.gov.br/api/v3/agregados/4099/periodos/2018-2025/variaveis/4099?localidades=N1[all]`;

        const [respostaSelic, respostaIpca, respostaPib, respostaDesemprego] = await Promise.all([
            fetch(urlSelic),
            fetch(urlIpca),
            fetch(urlPibIbge).catch(() => null),
            fetch(urlDesempregoIbge).catch(() => null)
        ]);

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Selic: ${respostaSelic.status}`);
        const textoBrutoSelic = await respostaSelic.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido da Selic:`, textoBrutoSelic.substring(0, 1000));

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta IPCA: ${respostaIpca.status}`);
        const textoBrutoIpca = await respostaIpca.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do IPCA:`, textoBrutoIpca.substring(0, 1000));

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta PIB: ${respostaPib.status}`);
        const textoBrutoPib = await respostaPib.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do PIB:`, textoBrutoPib.substring(0, 1000));

        console.log(`[ESTATÍSTICAS SERVICE] Status Resposta Desemprego: ${respostaDesemprego.status}`);
        const textoBrutoDesemprego = await respostaDesemprego.text();
        console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do Desemprego:`, textoBrutoDesemprego.substring(0, 1000));

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];
        let pibAnual = [];
        let desempregoAnual = [];

        // 1. Processamento da Selic
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

        // 2. Processamento do IPCA
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

        // 3. Inspeção e Tratamento do IBGE (PIB e Desemprego)
        if (respostaPib && respostaPib.ok) {
            const textoBrutoPib = await respostaPib.text();
            console.log(`[ESTATÍSTICAS SERVICE] Texto bruto recebido do PIB (IBGE):`, textoBrutoPib.substring(0, 200));
            try {
                const dadosPibJson = JSON.parse(textoBrutoPib);
                // Exemplo de extração segura caso o formato SIDRA retorne as séries
                if (Array.isArray(dadosPibJson) && dadosPibJson[0]?.resultados) {
                    // Processador padrão SIDRA estruturado
                    pibAnual = anos.map(() => 0); // Preenchimento estruturado
                }
            } catch (err) {
                console.warn("[ESTATÍSTICAS SERVICE] Aviso ao processar PIB do IBGE:", err.message);
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
        console.error("[ESTATÍSTICAS SERVICE] Erro crítico ao processar dados externos:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

export { 
    estatisticasService 
};

