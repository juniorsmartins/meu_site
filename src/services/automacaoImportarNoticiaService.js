import Parser from 'rss-parser';
import { Noticia } from '../database/schema/noticiaSchema.js';
import { EDITORIAS } from '../constants/editorias.js';

// Instância do Parser permitindo capturar tags customizadas do XML da Agência Brasil
const parser = new Parser({
    customFields: {
        item: [
            ['imagem-destaque', 'imagemDestaque'],
            ['dc:creator', 'creatorDinamico']
        ]
    }
});

/**
 * Registro de todas as fontes de RSS com suas URLs e funções de normalização específicas.
 */
const FONTES_RSS = [
    {
        chave: "AGENCIA_BRASIL",
        nome: "Agência Brasil",
        url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item)
    },
    {
        chave: "CAMARA_ECONOMIA",
        nome: "Câmara - Economia",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ECONOMIA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_CONSUMIDOR",
        nome: "Câmara - Consumidor",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/CONSUMIDOR",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    }
];

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

/**
 * Transforma o item bruto do XML da Agência Brasil para o Schema do MongoDB.
 * Extrai campos específicos como <imagem-destaque>, <dc:creator> e legenda do HTML.
 */
const normalizarNoticiaAgenciaBrasil = (item) => {

    const categoriaBruta = (item.categories && item.categories.length > 0) ? item.categories[0] : "";
    const categoriaPrincipal = extrairTextoCategoria(categoriaBruta);

    const conteudoBruto = item.description || item.content || "";

    // Mapeia a editoria exata aceita pelo sistema (em minúsculas)
    const editoriaFinal = mapearEditoriaCompativel(categoriaPrincipal);

    // Define o Chapéu em caixa alta usando a editoria mapeada
    const chapeuDinamico = editoriaFinal.toUpperCase();

    // Extrai o autor da matéria exclusivamente da tag <dc:creator>
    const autorMateria = item.creatorDinamico || item.creator || "Agência Brasil";

    // Extrai a legenda/crédito da foto de dentro do HTML da <description>
    let legendaEFotografo = "Foto: Agência Brasil / EBC";
    const matchCaption = conteudoBruto.match(/<div class="dnd-caption-wrapper">[\s\S]*?<h6[^>]*>([\s\S]*?)<\/h6>/i);
    if (matchCaption && matchCaption[1]) {
        legendaEFotografo = matchCaption[1].replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    } else {
        const matchAlt = conteudoBruto.match(/alt=["']([^"']+)["']/i);
        if (matchAlt && matchAlt[1] && !matchAlt[1].toLowerCase().includes("logo")) {
            legendaEFotografo = matchAlt[1].replace(/\s+/g, ' ').trim();
        }
    }

    // Limpa tags HTML para gerar uma linha fina legível de até 180 caracteres
    const textoLimpo = conteudoBruto.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    const linhaFinaDinamica = textoLimpo.length > 180 ? textoLimpo.substring(0, 177) + "..." : textoLimpo || item.title;

    return {
        chapeu: chapeuDinamico,
        titulo: item.title ? item.title.trim() : "",
        linhaFina: linhaFinaDinamica,
        conteudo: conteudoBruto,
        autor: autorMateria,
        editoria: editoriaFinal,
        imagemUrl: item.imagemDestaque || item.enclosure?.url || "https://agenciabrasil.ebc.com.br/sites/default/files/ebc_logo.png",
        imagemLegenda: legendaEFotografo,
        linkOriginal: item.link || ""
    };
};

/**
 * Normalizador exclusivo para os feeds RSS da Agência Câmara dos Deputados
 */
const normalizarNoticiaAgenciaCamara = (item, editoriaPadrao = "geral") => {

    // 1. O conteúdo real da Câmara vem na tag de conteúdo estendido do RSS (<content:encoded>)
    let conteudoBruto = item['content:encoded'] || item.content || item.description || "";

    // Variáveis padrão para fallback
    let imagemUrlExtraida = "https://www.camara.leg.br/tema/assets/images/camara-social.jpg";
    let legendaEFotografo = "Foto: Agência Câmara";

    // 2. Extrai a imagem principal de dentro do bloco <div class="image-container">
    const matchImg = conteudoBruto.match(/<div[^>]*class=["']image-container["'][\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
    if (matchImg && matchImg[1]) {
        imagemUrlExtraida = matchImg[1];
    } else {
        // Fallback: busca a primeira tag <img> caso não esteja no container padrão
        const matchAnyImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (matchAnyImg && matchAnyImg[1]) {
            imagemUrlExtraida = matchAnyImg[1];
        }
    }

    // 3. Extrai o crédito do fotógrafo e a legenda da imagem
    const matchCredito = conteudoBruto.match(/<div class="midia-creditos">[\s\S]*?<em>([\s\S]*?)<\/em><\/div>/i);
    const matchLegenda = conteudoBruto.match(/<div class="midia-legenda">([\s\S]*?)<\/div>/i);

    const textoLegenda = matchLegenda && matchLegenda[1] 
        ? matchLegenda[1].replace(/<[^>]*>?/gm, '').trim() 
        : "";
    const textoCredito = matchCredito && matchCredito[1] 
        ? matchCredito[1].replace(/<[^>]*>?/gm, '').trim() 
        : "Agência Câmara";

    if (textoLegenda) {
        legendaEFotografo = `${textoLegenda} - Foto: ${textoCredito}`;
    } else {
        legendaEFotografo = `Foto: ${textoCredito}`;
    }

    // 4. Remove o bloco da imagem principal do HTML do corpo para NÃO duplicar a foto na leitura
    conteudoBruto = conteudoBruto.replace(/<div[^>]*class=["']image-container["'][\s\S]*?<\/div>\s*<\/div>/gi, "");

    // 5. Gera a Linha Fina a partir da tag <description> ou do texto limpo
    const descricaoLimpa = (item.description || "").replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    const textoConteudoLimpo = conteudoBruto.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

    const linhaFinaFinal = (descricaoLimpa.length > 20) 
        ? descricaoLimpa 
        : (textoConteudoLimpo.substring(0, 177) + "...");

    return {
        chapeu: editoriaPadrao.toUpperCase(),
        titulo: item.title ? item.title.trim() : "",
        linhaFina: linhaFinaFinal,
        conteudo: conteudoBruto, // HTML limpo sem o container da imagem do topo
        autor: "Agência Câmara",
        editoria: mapearEditoriaCompativel(editoriaPadrao),
        imagemUrl: imagemUrlExtraida,
        imagemLegenda: legendaEFotografo,
        linkOriginal: item.link || item.guid || ""
    };
};

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

