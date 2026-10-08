import Parser from 'rss-parser';
import { Noticia } from '../database/schema/noticiaSchema.js';
import { EDITORIAS } from '../constants/editorias.js';
import { FONTES_RSS } from '../constants/fontesRssConfig.js';

// const parser = new Parser({
//     customFields: {
//         item: [
//             ['imagem-destaque', 'imagemDestaque'],
//             ['dc:creator', 'creatorDinamico']
//         ]
//     }
// });

const parser = new Parser({
    requestOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    },
    customFields: {
        item: [
            ['imagem-destaque', 'imagemDestaque'],
            ['dc:creator', 'creatorDinamico']
        ]
    }
});

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
            const resultado = await processarFeedRss(fonte.url, (item) => fonte.normalizador(item, mapearEditoriaCompativel));

            totalGeralImportadas += resultado.importadas;
            totalGeralIgnoradas += resultado.ignoradas;
            totalGeralAnalisadas += resultado.totalAnalisadas;

            relatorioFontes.push({
                fonte: fonte.nome,
                chave: fonte.chave,
                sucesso: true,
                ...resultado
            });

        } catch (error) {
            console.error(`Erro ao processar a fonte '${fonte.nome}':`, error);
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

const processarFeedRss = async (urlFeed, funcaoNormalizacao) => {
    const feed = await parser.parseURL(urlFeed);
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

const salvarNoticiaInedita = async (dadosNoticia) => {
    const noticiaExistente = await Noticia.findOne({
        $or: [
            { titulo: dadosNoticia.titulo },
            { linkOriginal: dadosNoticia.linkOriginal }
        ]
    });

    if (noticiaExistente) {
        return { salvo: false, motivo: "duplicada" };
    }

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


