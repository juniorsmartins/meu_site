import { noticiaCapaService } from '../services/noticiaCapaService.js';

console.log("Arquivo noticiaCapaController.js carregado.");

const noticiaCapaController = async (request, response) => {
    try {

        // Responder com a estrutura completa da Home pronta para renderização no frontend.
        const dadosCapa = await noticiaCapaService();
        return response.status(200).json(dadosCapa);

    } catch (error) {
        console.error("Erro ao carregar dados da Capa:", error);
        return response.status(500).json({ 
            error: "Erro interno ao carregar o portal de notícias." 
        });
    }
};

export { noticiaCapaController };

