import { FONTES_RSS } from '../../configs/fontesRssConfig.js';
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from '../../configs/constantsConfig.js';
import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';

/**
 * Service responsável por calcular e consolidar as métricas do painel administrativo
 */
const adminMetricasService = async () => {
    // MODIFICAÇÃO: Utiliza o repository para contar o total de notícias ao invés de acionar o model diretamente
    const totalNoticias = await noticiaRepository.contarTodas();
    const limiteCota = LIMITE_MAXIMO_NOTICIAS_DATABASE;
    const excedente = Math.max(0, totalNoticias - limiteCota);

    // 2. Métricas do FONTES_RSS (Extração dinâmica de portais únicos)
    const totalFeeds = FONTES_RSS.length;
    const portaisUnicos = [...new Set(FONTES_RSS.map(f => f.portal).filter(Boolean))];

    // 3. Objeto estruturado com os dados consolidados
    return {
        sucesso: true,
        bancoDados: {
            totalNoticias,
            limiteCota,
            excedente,
            emAviso: totalNoticias > limiteCota
        },
        rss: {
            totalFeeds,
            totalPortais: portaisUnicos.length,
            portais: portaisUnicos,
            subtextoFormatado: `${portaisUnicos.length} Portais: ${portaisUnicos.join(', ')}.`
        },
        sistema: {
            status: "online",
            timestamp: new Date().toISOString()
        }
    };
};

export { 
    adminMetricasService 
};

