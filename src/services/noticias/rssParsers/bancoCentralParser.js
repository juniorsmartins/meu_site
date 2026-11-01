import { mapearEditoriaCompativel } from '../editoriaHelper.js';

const URL_BASE_BCB = "https://www.bcb.gov.br";

// ATENÇÃO: substitua por uma imagem que você tenha confirmado (ex.: logo hospedado no seu próprio servidor).
const IMAGEM_PADRAO_BCB = "https://www.bcb.gov.br/favicon.ico";

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
 */
const normalizarNoticiaBancoCentral = (item, editoriaPadrao = "economia") => {

    // 1. No Atom, o corpo da notícia vem em <content type="html">, que o rss-parser expõe como item.content
    let conteudoBruto = item.content || item['content:encoded'] || item.description || "";

    // 2. Limpa resíduos do feed: ":" codificado como &#58; e caracteres invisíveis (zero-width space / BOM)
    conteudoBruto = conteudoBruto
        .replace(/&#58;/g, ":")
        .replace(/[\u200B\uFEFF]/g, "");

    // 3. Transforma links e imagens relativos (href="/..." e src="/...") em absolutos
    conteudoBruto = conteudoBruto.replace(/(href|src)=(["'])\/(?!\/)/gi, `$1=$2${URL_BASE_BCB}/`);

    // 4. Extrai a primeira imagem como destaque e a remove do corpo para não duplicar na leitura
    let imagemUrlExtraida = IMAGEM_PADRAO_BCB;
    const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (matchImg && matchImg[1]) {
        imagemUrlExtraida = matchImg[1];
        conteudoBruto = conteudoBruto.replace(matchImg[0], "");
    }

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

