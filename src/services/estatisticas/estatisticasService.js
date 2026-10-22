import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

// Códigos das Séries Temporais Oficiais no Banco Central do Brasil (SGS)
// 432 = Taxa Selic acumulada / 433 = IPCA (Inflação oficial acumulada)
const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

const estatisticasService = async () => {
    try {
        // 1. Requisições paralelas para as APIs oficiais do Banco Central
        const [respostaSelic, respostaIpca] = await Promise.all([
            fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json`),
            fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json`)
        ]);

        let anos = [];
        let selicAnual = [];
        let ipcaAnual = [];

        // 2. Processamento Dinâmico da Selic a partir do início da série histórica
        if (respostaSelic.ok) {
            const dadosSelicBrutos = await respostaSelic.json();
            if (Array.isArray(dadosSelicBrutos) && dadosSelicBrutos.length > 0) {
                
                // Filtramos para pegar o valor de dezembro (ou o último mês disponível) de cada ano da série
                const mapaAnualSelic = {};
                dadosSelicBrutos.forEach(item => {
                    // O formato da data na API do BC é "DD/MM/AAAA"
                    if (item.data && item.data.includes('/')) {
                        const partes = item.data.split('/'); // Divide a data em dia, mês e ano
                        const ano = partes[2]; // Extrai o ano
                        const mes = partes[1]; // Extrai o mês
                        
                        // Priorizamos o dado de dezembro (12) ou o último mês registrado do ano
                        if (mes === '12' || !mapaAnualSelic[ano]) {
                            mapaAnualSelic[ano] = Number(item.valor);
                        }
                    }
                });

                // Ordena os anos de forma cronológica (do início até o atual)
                anos = Object.keys(mapaAnualSelic).sort((a, b) => a - b); // Ordena os anos de forma cronológica - do início até o atual
                selicAnual = anos.map(ano => mapaAnualSelic[ano]); // Mapeia os valores da Selic para cada ano ordenado
            }
        }

        // 3. Processamento Dinâmico do IPCA usando a mesma base de anos extraída
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

        // PIB e Desemprego (mantidos vazios até integrarmos o SIDRA/IBGE)
        const pibAnual = []; 
        const desempregoAnual = [];

        return {
            anos: anos,
            pib: pibAnual,
            desemprego: desempregoAnual,
            ipca: ipcaAnual,
            selic: selicAnual
        };

    } catch (error) {
        console.error("Erro ao buscar estatísticas oficiais:", error);
        throw new AppError(MENSAGENS_ERRO.ESTATISTICAS.ERRO_AO_OBTER_DADOS, 503);
    }
};

export { 
    estatisticasService 
};

