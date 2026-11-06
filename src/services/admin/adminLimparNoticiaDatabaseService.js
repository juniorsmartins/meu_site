import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from "../../configs/constantsConfig.js";

const adminLimparNoticiaDatabaseService = async () => {

    const totalNoticias = await noticiaRepository.contarTodas();

    if (totalNoticias <= LIMITE_MAXIMO_NOTICIAS_DATABASE) {
        return {
            removidas: 0,
            totalAtual: totalNoticias,
            mensagem: `Nenhuma notícia foi removida. O total (${totalNoticias}) está dentro do limite de ${LIMITE_MAXIMO_NOTICIAS_DATABASE}.`
        };
    }

    // Calcula a quantidade de notícias que precisam ser removidas para ficar dentro do limite
    const quantidadeParaRemover = totalNoticias - LIMITE_MAXIMO_NOTICIAS_DATABASE;

    // Busca os IDs das notícias mais antigas listando todas e selecionando as primeiras
    // (Caso seu repositório não tenha uma busca específica com limit customizado para antigas, podemos usar a listagem ordenada ou injetar o método. Como padrão estruturado, listamos todas ordenadas do mais antigo ou criamos a lógica de corte).
    // Usaremos a listagem completa reversa ou o método do repositório:
    const todasNoticias = await noticiaRepository.listarTodas(); // Vem do mais novo pro mais antigo devido ao sort({createdAt: -1})
    // Para pegar as mais antigas, podemos inverter ou mapear:
    const noticiasAntigas = [...todasNoticias].reverse().slice(0, quantidadeParaRemover);

    // Extrai os IDs das notícias antigas para remoção
    const idsParaRemover = noticiasAntigas.map(n => n._id); 

    // Executa a remoção individual ou em lote iterando via repositório
    let removidasCount = 0;
    for (const id of idsParaRemover) {
        const deletada = await noticiaRepository.deletar(id);
        if (deletada) removidasCount++;
    }

    const totalAtualizado = await noticiaRepository.contarTodas();

    return {
        removidas: removidasCount,
        totalAtual: totalAtualizado,
        mensagem: `${removidasCount} notícias foram removidas para manter o limite de ${LIMITE_MAXIMO_NOTICIAS_DATABASE}.`
    };
}

export {
    adminLimparNoticiaDatabaseService
};

