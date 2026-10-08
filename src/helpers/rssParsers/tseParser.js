import { mapearEditoriaCompativel } from '../editoriaHelper.js';

/**
 * Módulo Específico para o TSE (Trata a estrutura RDF/RSS 1.0)
 */
const buscarEParsearTse = async (urlFeed, editoriaPadrao = "política") => {
    const resposta = await fetch(urlFeed, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rdf+xml, application/xml, text/xml'
        }
    });

    if (!resposta.ok) {
        throw new Error(`Status code ${resposta.status}`);
    }

    const xmlTexto = await resposta.text();
    const itensMatches = xmlTexto.match(/<item[\s\S]*?<\/item>/gi) || [];

    const noticiasNormalizadas = itensMatches.map(itemXml => {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);

        const titulo = titleMatch ? titleMatch[1].trim() : "";
        const link = linkMatch ? linkMatch[1].trim() : "";
        let conteudoBruto = descMatch ? descMatch[1].trim() : "";

        // PASSO CRÍTICO: Decodifica primeiro o HTML escapado (&lt;img...&gt; -> <img...>)
        conteudoBruto = decodificarEntidadesHTML(conteudoBruto);

        // Fallbacks padrão
        let imagemUrlExtraida = "https://www.tse.jus.br/logo.png";
        let legendaEFotografo = "Foto: Ascom / TSE";

        // 1. Extrai a imagem real e o atributo alt (legenda) do HTML decodificado
        const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/i) 
                      || conteudoBruto.match(/<img[^>]+src=["']([^"']+)["']/i);

        if (matchImg && matchImg[1]) {
            imagemUrlExtraida = matchImg[1];
            if (matchImg[2]) {
                legendaEFotografo = matchImg[2].trim();
            }
        }

        // 2. Limpa o HTML do corpo da notícia
        conteudoBruto = conteudoBruto
            .replace(/<img[^>]*>/gi, "")                      // Remove a tag <img> do corpo
            .replace(/<p><a[^>]*>Veja mais<\/a><\/p>/gi, "") // Remove o link 'Veja mais'
            .replace(/\]\]>/g, "")                            // Remove CDATA de fechamento
            .replace(/<!\[CDATA\[/g, "")                      // Remove CDATA de abertura
            .trim();

        // 3. Extrai o parágrafo de resumo para a Linha Fina
        const matchParagrafo = conteudoBruto.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        let linhaFinaFinal = matchParagrafo ? matchParagrafo[1].replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : "";

        if (!linhaFinaFinal || linhaFinaFinal.length < 15) {
            const textoLimpo = conteudoBruto.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
            linhaFinaFinal = textoLimpo.length > 180 ? textoLimpo.substring(0, 177) + "..." : textoLimpo;
        }

        return {
            chapeu: "JUSTIÇA ELEITORAL",
            titulo: decodificarEntidadesHTML(titulo),
            linhaFina: decodificarEntidadesHTML(linhaFinaFinal),
            conteudo: conteudoBruto,
            autor: "Tribunal Superior Eleitoral (TSE)",
            editoria: mapearEditoriaCompativel(editoriaPadrao),
            imagemUrl: imagemUrlExtraida,
            imagemLegenda: legendaEFotografo,
            linkOriginal: link
        };
    });

    return noticiasNormalizadas;
};

/**
 * Função completa de decodificação de HTML e entidades numéricas do TSE
 */
function decodificarEntidadesHTML(str = "") {
    if (!str) return "";
    return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&#186;/g, "º")
        .replace(/&#170;/g, "ª")
        .replace(/&#225;/g, "á")
        .replace(/&#233;/g, "é")
        .replace(/&#237;/g, "í")
        .replace(/&#243;/g, "ó")
        .replace(/&#250;/g, "ú")
        .replace(/&#227;/g, "ã")
        .replace(/&#245;/g, "õ")
        .replace(/&#231;/g, "ç")
        .replace(/&#224;/g, "à")
        .replace(/&#244;/g, "ô")
        .replace(/&#234;/g, "ê");
}

export { buscarEParsearTse };

