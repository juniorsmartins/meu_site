import { IndicadorAnualModel } from '../../models/indicadorSchema.js';
import { httpClient } from './chamadaExternaHttp.js';
import { regraAutorizarApenasAdmin } from '../../helpers/usuarioUtils.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO } from '../../configs/mensagensConfig.js';

const SERIE_BCB_SELIC = 432;
const SERIE_BCB_IPCA = 433;

function formatarDataBCB(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); 
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const estatisticasSyncService = async (usuarioAutenticado) => {

    regraAutorizarApenasAdmin(usuarioAutenticado);

    try {
        console.log("[SYNC ESTATÍSTICAS] Iniciando sincronização com APIs oficiais (IBGE e BCB)...");

        const dataHoje = new Date();
        const dataFimStr = formatarDataBCB(dataHoje);
                
        const dataInicio = new Date();
        dataInicio.setFullYear(dataHoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);

        // IBGE Sidra - Indicadores Econômicos
        // T = tabela; V = variável; P = período de tempo; C = classificação; G = visão territorial ou N = nível territorial (n1 = Brasil); H = header; F = formato; A = agregação; D = detalhe; M = moeda
        const urlPibIbge = `https://apisidra.ibge.gov.br/values/t/6784/n1/all/v/9810/p/all/h/y/f/a/d/m`;
        const urlDesempregoIbge = 'https://apisidra.ibge.gov.br/values/t/4562/n1/all/v/4099/p/all/h/y/f/a/d/m';

        // const urlSelicBc = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_SELIC}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;
        // const urlIpcaBc = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SERIE_BCB_IPCA}/dados?formato=json&dataInicial=${dataInicioStr}&dataFinal=${dataFimStr}`;

        // Executa as requisições em paralelo usando allSettled para evitar que uma falha derrube as outras
        // const [resPib, resDesemprego, resSelic, resIpca] = await Promise.all([
        //     httpClient(urlPibIbge),
        //     httpClient(urlDesempregoIbge),
        //     httpClient(urlSelicBc),
        //     httpClient(urlIpcaBc)
        // ]);

        const [ resPib, resDesemprego ] = await Promise.all([
            httpClient(urlPibIbge),
            httpClient(urlDesempregoIbge)
        ]);

        const agora = new Date();

        // 1. Processamento do PIB (IBGE SIDRA)
        if (resPib?.ok && Array.isArray(resPib.data) && resPib.data.length > 1) {
            try {
                // O SIDRA retorna um array. O índice 0 são os cabeçalhos.
                // Pegamos do índice 1 em diante, que são os dados reais.
                const dadosPib = resPib.data.slice(1);

                // Mapeia para o formato { ano: '1996', valor: 2.2 }
                const paresPib = dadosPib.map(item => {
                    const ano = item.D3N;     // Ex: "1996"
                    const valorStr = item.V;  // Ex: "2.2"
                    const valor = Number(valorStr);
                    
                    return { 
                        ano, 
                        valor: Number.isFinite(valor) ? valor : null 
                    };
                }).filter(item => item.ano && item.valor !== null); // Remove valores nulos ou inválidos ("...", "-")

                // Ordena os anos do mais antigo para o mais recente
                paresPib.sort((a, b) => Number(a.ano) - Number(b.ano));
                const anosPib = paresPib.map(item => item.ano);
                const valoresPib = paresPib.map(item => item.valor);

                if (anosPib.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'pib' },
                        { 
                            titulo: 'Crescimento do PIB (%)', 
                            fonte: 'IBGE (SIDRA - Tabela 6784)', 
                            unidade: '%', 
                            anos: anosPib, 
                            valores: valoresPib, 
                            ultimaAtualizacao: agora 
                        },
                        { upsert: true, returnDocument: 'after' }
                    );
                    console.log("[SYNC] PIB sincronizado com sucesso via SIDRA!");
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear PIB do IBGE (SIDRA):", e.message);
            }
        } else {
            console.warn("[SYNC] Falha ao obter dados do PIB na API SIDRA. Verifique o log do HTTP Client.");
        }

        // 2. Processamento do Desemprego (IBGE) - Com mapeamento próprio e independente de anos
        if (resDesemprego?.ok && Array.isArray(resDesemprego?.data) && resDesemprego?.data.length > 1) {
            try {

                const dadosDesemprego = resDesemprego.data.slice(1);

                // Mapeia para o formato { ano: '1996', valor: 2.2 }
                const paresDesemprego = dadosDesemprego.map(item => {
                    const ano = item.D3N;     // Ex: "1996"
                    const valorStr = item.V;  // Ex: "2.2"
                    const valor = Number(valorStr);
                    
                    return { 
                        ano, 
                        valor: Number.isFinite(valor) ? valor : null 
                    };
                }).filter(item => item.ano && item.valor !== null); // Remove valores nulos ou inválidos ("...", "-")

                paresDesemprego.sort((a, b) => Number(a.ano) - Number(b.ano));
                const anosDesemprego = paresDesemprego.map(item => item.ano);
                const valoresDesemprego = paresDesemprego.map(item => item.valor);

                if (anosDesemprego.length > 0) {
                    await IndicadorAnualModel.findOneAndUpdate(
                        { slug: 'desemprego' },
                        { 
                            titulo: 'Taxa Média de Desemprego (%)', 
                            fonte: 'IBGE (PNAD - Tabela 4099)', 
                            unidade: '%', 
                            anos: anosDesemprego, 
                            valores: valoresDesemprego, 
                            ultimaAtualizacao: agora 
                        },
                        { upsert: true, returnDocument: 'after' }
                    );
                    console.log("[SYNC] Desemprego sincronizado com sucesso via IBGE!");
                }
            } catch (e) {
                console.error("[SYNC] Erro ao mapear Desemprego do IBGE:", e.message);
            }
        } else {
            console.warn("[SYNC] Falha ao obter dados do Desemprego na API IBGE. Verifique o log do HTTP Client.");
        }

        // 1. Processamento do PIB (IBGE)
        // 1. Processamento do PIB (IBGE) - Com mapeamento próprio e independente de anos
        // if (resPib?.ok && Array.isArray(resPib.data) && resPib.data[0]?.resultados?.length) {
        //     try {
        //         const seriePib = resPib.data[0].resultados[0]?.series?.[0]?.serie; // Objeto com os anos como chaves e os valores do PIB como valores
        //         const anosPib = Object.keys(seriePib).sort((a, b) => a - b); // Ordena os anos em ordem crescente - do mais antigo para o mais recente
        //         const valoresPib = anosPib.map(periodo => Number(seriePib[periodo])); // Converte os valores para números - garantindo consistência no tipo de dado armazenado

        //         if (anosPib.length > 0) {
        //             await IndicadorAnualModel.findOneAndUpdate(
        //                 { slug: 'pib' },
        //                 { titulo: 'Crescimento do PIB (%)', fonte: 'IBGE (Agregado 9810)', unidade: '%', anos: anosPib, valores: valoresPib, ultimaAtualizacao: agora },
        //                 { upsert: true, returnDocument: 'after' }
        //             );
        //         }
        //     } catch (e) {
        //         console.error("[SYNC] Erro ao mapear PIB do IBGE:", e.message);
        //     }
        // }

        // 2. Processamento do Desemprego (IBGE) - Com mapeamento próprio e independente de anos
        // if (resDesemprego?.ok && Array.isArray(resDesemprego.data) && resDesemprego.data[0]?.resultados) {
        //     try {
        //         const serieDesemprego = resDesemprego.data[0].resultados[0].series[0].serie;
        //         const anosDesemprego = Object.keys(serieDesemprego).sort((a, b) => a - b);
        //         const valoresDesemprego = anosDesemprego.map(ano => Number(serieDesemprego[ano]));

        //         if (anosDesemprego.length > 0) {
        //             await IndicadorAnualModel.findOneAndUpdate(
        //                 { slug: 'desemprego' },
        //                 { titulo: 'Taxa Média de Desemprego (%)', fonte: 'IBGE (PNAD - Tabela 4099)', unidade: '%', anos: anosDesemprego, valores: valoresDesemprego, ultimaAtualizacao: agora },
        //                 { upsert: true, returnDocument: 'after' }
        //             );
        //         }
        //     } catch (e) {
        //         console.error("[SYNC] Erro ao mapear Desemprego do IBGE:", e.message);
        //     }
        // }

        // // 3. Processamento da Selic (BCB)
        // if (resSelic.ok && Array.isArray(resSelic.data)) {
        //     const mapaAnualSelic = {};
        //     resSelic.data.forEach(item => {
        //         if (item.data && item.data.includes('/')) {
        //             const partes = item.data.split('/');
        //             const ano = partes[2];
        //             const mes = partes[1];
        //             if (mes === '12' || !mapaAnualSelic[ano]) {
        //                 mapaAnualSelic[ano] = Number(item.valor);
        //             }
        //         }
        //     });
        //     const anosSelic = Object.keys(mapaAnualSelic).sort((a, b) => a - b);
        //     const valoresSelic = anosSelic.map(ano => mapaAnualSelic[ano]);

        //     if (anosSelic.length > 0) {
        //         await IndicadorAnualModel.findOneAndUpdate(
        //             { slug: 'selic' },
        //             { titulo: 'Taxa Básica de Juros - Selic (%)', fonte: 'Banco Central (Série 432)', unidade: '%', anos: anosSelic, valores: valoresSelic, ultimaAtualizacao: agora },
        //             { upsert: true, returnDocument: 'after' }
        //         );
        //     }
        // }

        // // 4. Processamento do IPCA (BCB)
        // if (resIpca.ok && Array.isArray(resIpca.data)) {
        //     const mapaAnualIpca = {};
        //     resIpca.data.forEach(item => {
        //         if (item.data && item.data.includes('/')) {
        //             const partes = item.data.split('/');
        //             const ano = partes[2];
        //             const mes = partes[1];
        //             if (mes === '12' || !mapaAnualIpca[ano]) {
        //                 mapaAnualIpca[ano] = Number(item.valor);
        //             }
        //         }
        //     });
        //     const anosIpca = Object.keys(mapaAnualIpca).sort((a, b) => a - b);
        //     const valoresIpca = anosIpca.map(ano => mapaAnualIpca[ano]);

        //     if (anosIpca.length > 0) {
        //         await IndicadorAnualModel.findOneAndUpdate(
        //             { slug: 'ipca' },
        //             { titulo: 'Inflação Oficial - IPCA (%)', fonte: 'Banco Central / IBGE (Série 433)', unidade: '%', anos: anosIpca, valores: valoresIpca, ultimaAtualizacao: agora },
        //             { upsert: true, returnDocument: 'after' }
        //         );
        //     }
        // }

        return { sucesso: true, mensagem: "Estatísticas sincronizadas com sucesso!" };

    } catch (error) {
        console.error("[SYNC ESTATÍSTICAS] Erro crítico na sincronização:", error);
        throw new AppError(MENSAGENS_ERRO.SERVIDOR.ERRO_INTERNO, 500);
    }
};

export { 
    estatisticasSyncService 
};

