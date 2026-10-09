import Parser from 'rss-parser';
import { Noticia } from '../database/schema/noticiaSchema.js';
import { EDITORIAS } from '../constants/editorias.js';
import { FONTES_RSS } from '../constants/fontesRssConfig.js';

process.removeAllListeners('warning');

const parser = new Parser({
    customFields: {
        item: [
            ['imagem-destaque', 'imagemDestaque'],
            ['dc:creator', 'creatorDinamico']
        ]
    }
});

const aguardarMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// SERVIÇO PRINCIPAL (Orquestrador)
// ============================================================================

const automacaoImportarNoticiaService = async () => {

    const relatorioFontes = [];
    let totalGeralImportadas = 0;
    let totalGeralIgnoradas = 0;
    let totalGeralAnalisadas = 0;

    for (const fonte of FONTES_RSS) {
        try {
            let resultado;

            // Se a fonte possui um leitor próprio (ex: TSE), usa ele. Se não, usa o fluxo genérico do RSS Parser.
            if (fonte.buscarCustomizado) {
                resultado = await processarFonteCustomizada(fonte);

            } else {
                resultado = await processarFeedRssPadrão(fonte.url, (item) => fonte.normalizador(item, mapearEditoriaCompativel));
            }

            totalGeralImportadas += resultado.importadas;
            totalGeralIgnoradas += resultado.ignoradas;
            totalGeralAnalisadas += resultado.totalAnalisadas;

            relatorioFontes.push({
                fonte: fonte.nome,
                chave: fonte.chave,
                sucesso: true,
                ...resultado
            });

            await aguardarMs(150); // Pequena pausa entre cada fonte RSS para evitar sobrecarga de requisições

        } catch (error) {
            console.warn(`[Automação RSS] Aviso na fonte '${fonte.nome}': ${error.message}`);
            relatorioFontes.push({
                fonte: fonte.nome,
                chave: fonte.chave,
                sucesso: false,
                erro: error.message
            });
        }
    }

    return {
        sucesso: true,
        resumo: {
            totalImportadas: totalGeralImportadas,
            totalIgnoradas: totalGeralIgnoradas,
            totalAnalisadas: totalGeralAnalisadas,
            fontesProcessadas: FONTES_RSS.length
        },
        detalhesPorFonte: relatorioFontes,
        mensagem: `Processamento concluído. ${totalGeralImportadas} notícias inéditas importadas no total.`
    };
};

// ============================================================================
// FUNÇÕES AUXILIARES DE BANCO E ROTEAMENTO
// ============================================================================

// Fluxo Padrão Genérico para RSS 2.0 (Câmara, Agência Brasil, etc.)
const processarFeedRssPadrão = async (urlFeed, funcaoNormalizacao) => {

    const resposta = await fetch(urlFeed, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*'
        }
    });

    if (!resposta.ok) {
        throw new Error(`Status code ${resposta.status}`);
    }

    const xmlTexto = await resposta.text();
    const feed = await parser.parseString(xmlTexto);

    let importadas = 0;
    let ignoradas = 0;

    for (const item of feed.items) {
        const dadosNoticia = funcaoNormalizacao(item);
        const resultado = await salvarNoticiaInedita(dadosNoticia);
        if (resultado.salvo) importadas++;
        else ignoradas++;
    }

    return { importadas, ignoradas, totalAnalisadas: feed.items.length };
};

// Fluxo para Fontes com Leitor Customizado (ex: TSE)
const processarFonteCustomizada = async (fonte) => {
    const listaNoticiasNormalizadas = await fonte.buscarCustomizado();
    let importadas = 0;
    let ignoradas = 0;

    for (const dadosNoticia of listaNoticiasNormalizadas) {
        const resultado = await salvarNoticiaInedita(dadosNoticia);
        if (resultado.salvo) importadas++;
        else ignoradas++;
    }

    return { importadas, ignoradas, totalAnalisadas: listaNoticiasNormalizadas.length };
};

const salvarNoticiaInedita = async (dadosNoticia) => {
    const noticiaExistente = await Noticia.findOne({
        $or: [
            { titulo: dadosNoticia.titulo },
            { linkOriginal: dadosNoticia.linkOriginal }
        ]
    });

    if (noticiaExistente) return { salvo: false, motivo: "duplicada" };

    const novaNoticia = new Noticia(dadosNoticia);
    await novaNoticia.save();

    return { salvo: true };
};

const mapearEditoriaCompativel = (categoriaRss = "") => {
    if (!categoriaRss) return "geral";
    const categoriaNormalizada = removerAcentosECaixa(categoriaRss);
    const editoriaEncontrada = EDITORIAS.find(
        (editoria) => removerAcentosECaixa(editoria) === categoriaNormalizada
    );
    return editoriaEncontrada || "geral";
};

const removerAcentosECaixa = (texto = "") => {
    if (!texto) return "";
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

export {
    automacaoImportarNoticiaService
};


