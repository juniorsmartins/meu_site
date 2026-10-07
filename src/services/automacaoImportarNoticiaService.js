import Parser from 'rss-parser';
import { Noticia } from '../database/schema/noticiaSchema.js';
import { EDITORIAS } from '../constants/editorias.js';
import { FONTES_RSS } from '../constants/fontesRssConfig.js';

// Instância do Parser permitindo capturar tags customizadas do XML da Agência Brasil
const parser = new Parser({
    customFields: {
        item: [
            ['imagem-destaque', 'imagemDestaque'],
            ['dc:creator', 'creatorDinamico']
        ]
    }
});

// ============================================================================
// 1. SERVIÇO PRINCIPAL (Ponto de Entrada)
// ============================================================================

/**
 * Ponto de entrada chamado pelo Controller.
 * Percorre TODAS as fontes configuradas em FONTES_RSS e executa a importação.
 */
const automacaoImportarNoticiaService = async () => {

    const relatorioFontes = [];
    let totalGeralImportadas = 0;
    let totalGeralIgnoradas = 0;
    let totalGeralAnalisadas = 0;

    // Percorre cada fonte configurada no array FONTES_RSS
    for (const fonte of FONTES_RSS) {

        try {
            const resultado = await processarFeedRss(fonte.url, fonte.normalizador);

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
// 2. MOTOR GENÉRICO DE PROCESSAMENTO DE FEED
// ============================================================================

/**
 * Faz o download do XML da URL fornecida, percorre os itens aplicando
 * a função de normalização e persiste apenas as matérias inéditas.
 */
const processarFeedRss = async (urlFeed, funcaoNormalizacao) => {

    // 1. Baixa e converte o XML em objetos JavaScript
    const feed = await parser.parseURL(urlFeed);

    let importadas = 0;
    let ignoradas = 0;

    // 2. Itera sobre cada notícia do feed
    for (const item of feed.items) {
        const dadosNoticia = funcaoNormalizacao(item);
        const resultado = await salvarNoticiaInedita(dadosNoticia);

        if (resultado.salvo) {
            importadas++;
        } else {
            ignoradas++;
        }
    }

    return {
        importadas,
        ignoradas,
        totalAnalisadas: feed.items.length
    };
};

// ============================================================================
// 3. PARSERS ESPECÍFICOS DE FONTES
// ============================================================================

// importações dos parsers específicos


// ============================================================================
// 4. FUNÇÕES UTILITÁRIAS DE BANCO DE DADOS E FORMATAÇÃO
// ============================================================================

/**
 * Consulta o MongoDB para evitar duplicação por título ou linkOriginal.
 * Se for inédita, grava o novo documento.
 */
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

/**
 * Compara a categoria do RSS com o array EDITORIAS do sistema (ignorando acentos e caixa).
 * Retorna a editoria válida em minúsculas ou "geral" como fallback.
 */
const mapearEditoriaCompativel = (categoriaRss = "") => {

    if (!categoriaRss) return "geral";

    const categoriaNormalizada = removerAcentosECaixa(categoriaRss);

    const editoriaEncontrada = EDITORIAS.find(
        (editoria) => removerAcentosECaixa(editoria) === categoriaNormalizada
    );

    return editoriaEncontrada || "geral";
};

/**
 * Auxiliar: Remove acentos, caracteres especiais e converte o texto para minúsculas.
 * Garante que o valor recebido seja convertido para String com segurança.
 */
const removerAcentosECaixa = (texto = "") => {
    if (!texto) return "";
    
    // Converte para String caso receba um objeto ou outro tipo de dado
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

/**
 * Extrai o texto de uma categoria, lidando com diferentes formatos (string, objeto XML, objeto genérico).
 */
const extrairTextoCategoria = (categoria) => {
    if (!categoria) return "";
    if (typeof categoria === "string") return categoria;
    if (typeof categoria === "object" && categoria._) return categoria._; // Tratamento de atributo XML
    if (typeof categoria === "object" && categoria.name) return categoria.name;
    return String(categoria);
};

export {
    automacaoImportarNoticiaService
};

