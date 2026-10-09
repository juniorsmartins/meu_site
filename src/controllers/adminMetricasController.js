import { adminMetricasService } from '../services/adminMetricasService.js';

const adminMetricasController = async (request, response) => {

    try {

        const metricas = await adminMetricasService();
        return response.status(200).json(metricas);

    } catch (error) {
        console.error("Erro ao gerar métricas do painel admin:", error);
        return response.status(500).json({
            sucesso: false,
            erro: "Falha ao carregar métricas do painel administrativo."
        });
    }
};

export { 
    adminMetricasController 
};

