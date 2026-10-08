import { mapearEditoriaCompativel, extrairTextoCategoria } from '../editoriaHelper.js';

/**
 * Transforma o item bruto do XML da Agência Brasil para o Schema do MongoDB.
 * Extrai campos específicos como <imagem-destaque>, <dc:creator> e legenda do HTML.
 */
const normalizarNoticiaAgenciaBrasil = (item) => {

    const categoriaBruta = (item.categories && item.categories.length > 0) ? item.categories[0] : "";
    const categoriaPrincipal = extrairTextoCategoria(categoriaBruta);

    let conteudoBruto = item.description || item.content || "";

    // Limpeza Cirúrgica do Bloco "Notícias relacionadas:" + a lista <ul> com os links
    conteudoBruto = conteudoBruto
        .replace(/<(h[1-6]|p|strong|div)[^>]*>\s*Notícias relacionadas:?\s*<\/\1>\s*<ul[\s\S]*?<\/ul>/gi, "")
        .replace(/<h[1-6][^>]*>\s*Notícias relacionadas:?\s*<\/h[1-6]>\s*<ul[\s\S]*?<\/ul>/gi, "");

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
        conteudo: conteudoBruto, // Salva o HTML sem o h3 e sem o ul de notícias relacionadas
        autor: autorMateria,
        editoria: editoriaFinal,
        imagemUrl: item.imagemDestaque || item.enclosure?.url || "https://agenciabrasil.ebc.com.br/sites/default/files/ebc_logo.png",
        imagemLegenda: legendaEFotografo,
        linkOriginal: item.link || ""
    };
};

export { 
    normalizarNoticiaAgenciaBrasil 
};

