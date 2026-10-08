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

        // Imagem e Legenda Padrão (Fallback)
        let imagemUrlExtraida = "https://www.tse.jus.br/logo.png";
        let legendaEFotografo = "Foto: Ascom / TSE";

        // 1. Extrai a imagem real e seu alt (legenda) de dentro do HTML/CDATA da descrição
        const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/i) 
                      || conteudoBruto.match(/<img[^>]+src=["']([^"']+)["']/i);

        if (matchImg && matchImg[1]) {
            imagemUrlExtraida = matchImg[1];

            if (matchImg[2]) {
                // Decodifica entidades HTML como &#186; e &#225; do alt do TSE
                const altDecodificado = decodificarEntidadesHTML(matchImg[2].trim());
                legendaEFotografo = altDecodificado;
            }
        }

        // 2. Limpeza do HTML do corpo da notícia
        conteudoBruto = conteudoBruto
            .replace(/<img[^>]*>/gi, "") // Remove a tag img do corpo para não duplicar na página
            .replace(/&lt;img[^&]*&gt;/gi, "") // Remove caso esteja escapada (&lt;img...&gt;)
            .replace(/<p><a[^>]*>Veja mais<\/a><\/p>/gi, "") // Remove o link 'Veja mais'
            .replace(/\]\]>/g, "") // Remove resíduos de fechamento CDATA
            .replace(/<!\[CDATA\[/g, "") // Remove resíduos de abertura CDATA
            .trim();

        // 3. Extrai a Linha Fina (primeiro parágrafo de resumo)
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
            autor: "Tribunal Superior Eleitoral",
            editoria: mapearEditoriaCompativel(editoriaPadrao),
            imagemUrl: imagemUrlExtraida,
            imagemLegenda: legendaEFotografo,
            linkOriginal: link
        };
    });

    return noticiasNormalizadas;
};

/**
 * Auxiliar para converter códigos como &#186; e &#225; em caracteres normais (º, á, etc.)
 */
function decodificarEntidadesHTML(str = "") {
    return str
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
        .replace(/&amp;/g, "&");
}

export { buscarEParsearTse };

