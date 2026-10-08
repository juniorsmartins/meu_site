import { mapearEditoriaCompativel } from '../editoriaHelper.js';

/**
 * Módulo Específico para o TSE (Trata a estrutura RDF/RSS 1.0)
 */
const buscarEParsearTse = async (urlFeed, editoriaPadrao = "política") => {
    // 1. Fetch com User-Agent para evitar bloqueio 403
    const resposta = await fetch(urlFeed, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rdf+xml, application/xml, text/xml'
        }
    });

    if (!resposta.ok) {
        throw new Error(`Status code ${resposta.status}`);
    }

    const xmlTexto = await resposta.text();

    // 2. Extrai os blocos <item>...</item> via Regex/Parser direto
    const itensMatches = xmlTexto.match(/<item[\s\S]*?<\/item>/gi) || [];

    const noticiasNormalizadas = itensMatches.map(itemXml => {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);

        const titulo = titleMatch ? titleMatch[1].trim() : "";
        const link = linkMatch ? linkMatch[1].trim() : "";
        let conteudoBruto = descMatch ? descMatch[1].trim() : "";

        // Extrai a imagem
        let imagemUrlExtraida = "https://www.tse.jus.br/logo.png";
        let legendaEFotografo = "Foto: Ascom / TSE";

        const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/i) 
                      || conteudoBruto.match(/<img[^>]+src=["']([^"']+)["']/i);

        if (matchImg && matchImg[1]) {
            imagemUrlExtraida = matchImg[1];
            if (matchImg[2]) legendaEFotografo = `Foto: ${matchImg[2].trim()} - TSE`;
        }

        // Limpa o HTML do corpo
        conteudoBruto = conteudoBruto
            .replace(/<img[^>]*>/i, "")
            .replace(/<p><a[^>]*>Veja mais<\/a><\/p>/gi, "");

        // Linha Fina
        const matchParagrafo = conteudoBruto.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        let linhaFinaFinal = matchParagrafo ? matchParagrafo[1].replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : "";

        if (!linhaFinaFinal || linhaFinaFinal.length < 15) {
            const textoLimpo = conteudoBruto.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
            linhaFinaFinal = textoLimpo.length > 180 ? textoLimpo.substring(0, 177) + "..." : textoLimpo;
        }

        return {
            chapeu: "JUSTIÇA ELEITORAL",
            titulo: titulo,
            linhaFina: linhaFinaFinal,
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

export { buscarEParsearTse };

