import { mapearEditoriaCompativel } from '../editoriaHelper.js';

/**
 * Normalizador exclusivo para o feed RDF/RSS 1.0 do Tribunal Superior Eleitoral (TSE)
 */
const normalizarNoticiaTse = (item, editoriaPadrao = "política") => {

    // 1. O conteúdo do TSE vem acumulado dentro da tag <description>
    let conteudoBruto = item.description || item.content || "";

    // Imagem e legenda padrão (Fallback)
    let imagemUrlExtraida = "https://www.tse.jus.br/logo.png";
    let legendaEFotografo = "Foto: Ascom / TSE";

    // 2. Extrai a imagem principal do TSE (<img src="..." alt="...">)
    const matchImg = conteudoBruto.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/i) 
                  || conteudoBruto.match(/<img[^>]+src=["']([^"']+)["']/i);

    if (matchImg && matchImg[1]) {
        imagemUrlExtraida = matchImg[1];
        if (matchImg[2]) {
            legendaEFotografo = `Foto: ${matchImg[2].trim()} - TSE`;
        }
    }

    // 3. Remove a primeira tag <img> do corpo para não duplicar no leitor de notícia
    conteudoBruto = conteudoBruto.replace(/<img[^>]*>/i, "");

    // 4. Remove o link final "Veja mais" inserido pelo CMS do TSE
    conteudoBruto = conteudoBruto.replace(/<p><a[^>]*>Veja mais<\/a><\/p>/gi, "");

    // 5. Extrai a Linha Fina (primeiro parágrafo limpo do texto)
    const matchParagrafo = conteudoBruto.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    let linhaFinaFinal = "";

    if (matchParagrafo && matchParagrafo[1]) {
        linhaFinaFinal = matchParagrafo[1].replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    }

    if (!linhaFinaFinal || linhaFinaFinal.length < 15) {
        const textoLimpo = conteudoBruto.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
        linhaFinaFinal = textoLimpo.length > 180 ? textoLimpo.substring(0, 177) + "..." : textoLimpo;
    }

    return {
        chapeu: "JUSTIÇA ELEITORAL",
        titulo: item.title ? item.title.trim() : "",
        linhaFina: linhaFinaFinal,
        conteudo: conteudoBruto,
        autor: "Tribunal Superior Eleitoral",
        editoria: mapearEditoriaCompativel(editoriaPadrao),
        imagemUrl: imagemUrlExtraida,
        imagemLegenda: legendaEFotografo,
        linkOriginal: item.link || item['rdf:about'] || ""
    };
};

export {
    normalizarNoticiaTse
};

