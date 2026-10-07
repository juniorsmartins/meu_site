
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

export {
    normalizarNoticiaAgenciaCamara
};
