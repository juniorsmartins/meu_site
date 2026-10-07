import Parser from 'rss-parser';
import { Noticia } from '../database/schema/noticiaSchema.js';

const parser = new Parser();

// URL do Feed RSS oficial da Agência Brasil (Geral/Últimas notícias)
const AGENCIA_BRASIL_RSS = "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml";

const automacaoImportarNoticiaService = async () => {

    // 1. Faz o download e parse do XML do Feed
    const feed = await parser.parseURL(AGENCIA_BRASIL_RSS);

    let noticiasImportadas = 0;
    let noticiasIgnoradas = 0;

    // 2. Percorre as notícias retornadas no Feed
    for (const item of feed.items) {
        // Verifica se a matéria já foi cadastrada anteriormente buscando pelo título
        const noticiaExistente = await Noticia.findOne({ titulo: item.title });

        if (noticiaExistente) {
            noticiasIgnoradas++;
            continue; // Pula para a próxima notícia sem salvar duplicado
        }

        // 3. Trata e ajusta o conteúdo do RSS para o formato da sua aplicação
        // Extrai o resumo/conteúdo limpo do feed
        const conteudoFormatado = item.contentSnippet || item.content || item.summary || "";

        // Instancia o objeto no Schema da Notícia
        const novaNoticia = new Noticia({
            chapeu: "AGÊNCIA BRASIL",
            titulo: item.title,
            linhaFina: item.contentSnippet ? item.contentSnippet.substring(0, 180) + "..." : item.title,
            conteudo: conteudoFormatado,
            autor: "Agência Brasil",
            editoria: "Geral", // Você pode mapear por palavra-chave se desejar
            imagemUrl: item.enclosure?.url || "https://agenciabrasil.ebc.com.br/sites/default/files/ebc_logo.png",
            imagemLegenda: "Foto: Agência Brasil / EBC",
            linkOriginal: item.link
        });

        // 4. Salva no MongoDB
        await novaNoticia.save();
        noticiasImportadas++;
    }

    return {
        sucesso: true,
        importadas: noticiasImportadas,
        ignoradasDuplicadas: noticiasIgnoradas,
        totalAnalisadas: feed.items.length,
        mensagem: `Processamento concluído. ${noticiasImportadas} notícias inéditas foram importadas da Agência Brasil.`
    };
};

export {
    automacaoImportarNoticiaService
};
