import { mapearEditoriaCompativel } from '../editoriaHelper.js';

const URL_BASE_BCB = "https://www.bcb.gov.br";

// Fuso usado para decidir o que é "hoje". O feed do BC publica em horário de Brasília (-03:00).
const FUSO_HORARIO = "America/Sao_Paulo";

/**
 * Converte uma data para "AAAA-MM-DD" no fuso configurado.
 * Retorna null se a data for inválida.
 */
const formatarDataNoFuso = (data) => {
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return null;
    return dataObj.toLocaleDateString("en-CA", { timeZone: FUSO_HORARIO });
};

/**
 * Verifica se a data do item cai no mesmo dia da data de referência.
 */
const ehDoDia = (dataItem, dataReferencia) => {
    const diaItem = formatarDataNoFuso(dataItem);
    return diaItem !== null && diaItem === formatarDataNoFuso(dataReferencia);
};

/**
 * Decodifica apenas as entidades que sobram no texto puro do feed do BC.
 */
const decodificarEntidadesBasicas = (texto = "") => texto
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * Pega o primeiro bloco de texto "de verdade" (>= 20 caracteres) para servir de linha fina.
 */
const extrairLinhaFina = (html = "", tituloFallback = "") => {
    const blocos = html
        .split(/<\/(?:p|div|li)>/i)
        .map(bloco => decodificarEntidadesBasicas(bloco.replace(/<[^>]*>?/gm, '')).replace(/\s+/g, ' ').trim());

    const texto = blocos.find(bloco => bloco.length >= 20) || tituloFallback;
    return texto.length > 180 ? texto.substring(0, 177) + "..." : texto;
};

/**
 * Normalizador exclusivo para o feed Atom de notícias do Banco Central do Brasil.
 * Retorna null quando a notícia deve ser descartada (não é do dia ou não tem imagem).
 * O 3º parâmetro existe para facilitar testes (permite simular outro "hoje").
 */
const normalizarNoticiaBancoCentral = (item, editoriaPadrao = "economia", dataReferencia = new Date()) => {

    // FILTRO 1: só notícias do dia. O rss-parser converte o <updated> do Atom em isoDate/pubDate.
    if (!ehDoDia(item.isoDate || item.pubDate, dataReferencia)) return null;

    // 1. No Atom, o corpo da notícia vem em <content type="html">, que o rss-parser expõe como item.content
    let conteudoBruto = item.content || item['content:encoded'] || item.description || "";

    // 2. Limpa resíduos do feed: ":" codificado como &#58; e caracteres invisíveis (zero-width space / BOM)
    conteudoBruto = conteudoBruto
        .replace(/&#58;/g, ":")
        .replace(/[\u200B\uFEFF]/g, "");

    // 3. Transforma links e imagens relativos (href="/..." e src="/...") em absolutos
    conteudoBruto = conteudoBruto.replace(/(href|src)=(["'])\/(?!\/)/gi, `$1=$2${URL_BASE_BCB}/`);

    // FILTRO 2: só notícias com imagem. Sem imagem, não há fallback: o item é descartado.
    const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (!matchImg || !matchImg[1]) return null;

    // 4. Usa a primeira imagem como destaque e a remove do corpo para não duplicar na leitura
    const imagemUrlExtraida = matchImg[1];
    conteudoBruto = conteudoBruto.replace(matchImg[0], "");

    // 5. Remove blocos vazios que sobram (div só com <br> ou &nbsp;)
    conteudoBruto = conteudoBruto
        .replace(/<div[^>]*>(?:\s|<br\s*\/?>|&#160;|&nbsp;)*<\/div>/gi, "")
        .trim();

    const titulo = item.title ? decodificarEntidadesBasicas(item.title.trim()) : "";

    return {
        chapeu: "BANCO CENTRAL",
        titulo,
        linhaFina: extrairLinhaFina(conteudoBruto, titulo),
        conteudo: conteudoBruto,
        autor: "Banco Central do Brasil",
        editoria: mapearEditoriaCompativel(editoriaPadrao),
        imagemUrl: imagemUrlExtraida,
        // O "alt" das imagens do BC é só o nome do arquivo, então não serve como legenda
        imagemLegenda: "Imagem: Banco Central do Brasil",
        linkOriginal: item.link || item.guid || item.id || ""
    };
};

export {
    normalizarNoticiaBancoCentral
};

