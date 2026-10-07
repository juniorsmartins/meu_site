import { Noticia } from "../database/schema/noticiaSchema.js"; // Importe seu schema de Notícia
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from "../constants/geralConstants.js";

const noticiaLimparDatabaseService = async () => {

    // Conta o total de notícias no banco de dados
    const totalNoticias = await Noticia.countDocuments();

    if (totalNoticias <= LIMITE_MAXIMO_NOTICIAS_DATABASE) {
        return {
            removidas: 0,
            totalAtual: totalNoticias,
            mensagem: `Nenhuma notícia foi removida. O total (${totalNoticias}) está dentro do limite de ${LIMITE_MAXIMO_NOTICIAS}.`
        };
    }

    // Calcula a quantidade de notícias que precisam ser removidas para ficar dentro do limite
    const quantidadeParaRemover = totalNoticias - LIMITE_MAXIMO_NOTICIAS_DATABASE;

    // Remove as notícias mais antigas para ficar dentro do limite
    const noticiasRemovidas = await Noticia.find()
        .sort({ createdAt: 1 }) // 1 = Ordem ascendente (mais antigas primeiro)
        .limit(quantidadeParaRemover)
        .deleteMany();

    return {
        removidas: noticiasRemovidas.deletedCount,
        totalAtual: totalNoticias - noticiasRemovidas.deletedCount,
        mensagem: `${noticiasRemovidas.deletedCount} notícias foram removidas para manter o limite de ${LIMITE_MAXIMO_NOTICIAS_DATABASE}.`
    };

}

export {
    noticiaLimparDatabaseService
};


