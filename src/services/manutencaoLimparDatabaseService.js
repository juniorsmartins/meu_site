import { Noticia } from "../database/schema/noticiaSchema.js"; // Importe seu schema de Notícia
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from "../constants/geralConstants.js";

const manutencaoLimparDatabaseService = async () => {

    // Conta o total de notícias no banco de dados
    const totalNoticias = await Noticia.countDocuments();

    if (totalNoticias <= LIMITE_MAXIMO_NOTICIAS_DATABASE) {
        return {
            removidas: 0,
            totalAtual: totalNoticias,
            mensagem: `Nenhuma notícia foi removida. O total (${totalNoticias}) está dentro do limite de ${LIMITE_MAXIMO_NOTICIAS_DATABASE}.`
        };
    }

    // Calcula a quantidade de notícias que precisam ser removidas para ficar dentro do limite
    const quantidadeParaRemover = totalNoticias - LIMITE_MAXIMO_NOTICIAS_DATABASE;

    // Busca os IDs das notícias mais antigas
    const noticiasAntigas = await Noticia.find()
        .sort({ createdAt: 1 }) // Mais antigas primeiro
        .limit(quantidadeParaRemover)
        .select("_id");

    // Extrai os IDs das notícias antigas para remoção
    const idsParaRemover = noticiasAntigas.map(n => n._id); 

    // Executa o deleteMany no Model com o filtro $in
    const resultadoDelete = await Noticia.deleteMany({ _id: { $in: idsParaRemover } });

    const totalAtualizado = await Noticia.countDocuments();

    return {
        removidas: resultadoDelete.deletedCount,
        totalAtual: totalAtualizado,
        mensagem: `${resultadoDelete.deletedCount} notícias foram removidas para manter o limite de ${LIMITE_MAXIMO_NOTICIAS_DATABASE}.`
    };
}

export {
    manutencaoLimparDatabaseService
};


