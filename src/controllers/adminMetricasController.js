import { Noticia } from '../database/schema/noticiaSchema.js';
import { FONTES_RSS } from '../constants/fontesRssConfig.js';
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from '../constants/geralConstants.js';

const adminMetricasController = async (request, response) => {

    return await obterMetricasAdmin(request, response);
};

/**
 * Controller que consolida todas as métricas para o Painel de Controle Admin
 */
const obterMetricasAdmin = async (req, res) => {

    try {

        // 1. Métricas do Banco de Dados (MongoDB)
        const totalNoticias = await Noticia.countDocuments();
        const limiteCota = LIMITE_MAXIMO_NOTICIAS_DATABASE;
        const excedente = Math.max(0, totalNoticias - limiteCota);

        // 2. Métricas do FONTES_RSS
        const totalFeeds = FONTES_RSS.length;
        const portaisUnicos = [...new Set(FONTES_RSS.map(f => f.portal).filter(Boolean))];

        // 3. Monta o objeto consolidador de KPIs
        return res.status(200).json({
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
                subtextoFormatado: `Oriundas de ${portaisUnicos.length} Portais: ${portaisUnicos.join(', ')}.`
            },
            // Preparado para expansões futuras (ex: estatísticas de visitas, logs de auditoria, etc.)
            sistema: {
                status: "online",
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Erro ao gerar métricas do painel admin:", error);
        return res.status(500).json({
            sucesso: false,
            erro: "Falha ao carregar KPIs do painel administrativo."
        });
    }
};

export { 
    adminMetricasController 
};

