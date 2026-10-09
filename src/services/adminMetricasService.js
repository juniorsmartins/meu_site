import { Noticia } from '../database/schema/noticiaSchema.js';
import { FONTES_RSS } from '../constants/fontesRssConfig.js';
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from '../constants/geralConstants.js';

/**
 * Service responsável por calcular e consolidar as métricas do painel administrativo
 */
const adminMetricasService = async () => {
    // 1. Métricas do Banco de Dados (MongoDB)
    const totalNoticias = await Noticia.countDocuments();
    const limiteCota = LIMITE_MAXIMO_NOTICIAS_DATABASE || 100;
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

