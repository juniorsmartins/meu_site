import { EDITORIAS } from '../constants/editorias.js';

/**
 * Remove acentos e converte para minúsculas
 */
const removerAcentosECaixa = (texto = "") => {
    if (!texto) return "";
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

/**
 * Garante a extração de texto de categorias do RSS
 */
const extrairTextoCategoria = (categoria) => {
    if (!categoria) return "";
    if (typeof categoria === "string") return categoria;
    if (typeof categoria === "object" && categoria._) return categoria._;
    if (typeof categoria === "object" && categoria.name) return categoria.name;
    return String(categoria);
};

/**
 * Mapeia a categoria do RSS diretamente para o array EDITORIAS
 */
const mapearEditoriaCompativel = (categoriaRss = "") => {
    if (!categoriaRss) return "geral";
    const categoriaNormalizada = removerAcentosECaixa(categoriaRss);

    const editoriaEncontrada = EDITORIAS.find(
        (editoria) => removerAcentosECaixa(editoria) === categoriaNormalizada
    );

    return editoriaEncontrada || "geral";
};

export { 
    mapearEditoriaCompativel,
    removerAcentosECaixa,
    extrairTextoCategoria
};

