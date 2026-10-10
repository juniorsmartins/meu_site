import { automacaoImportarNoticiaService } from "../services/automacaoImportarNoticiaService.js";

const automacaoImportarNoticiaController = async (request, response) => {

    try {

        // Permitir a filtragem seletiva da fonte de RSS a ser importada.
        const { portal } = request.query;

        // Repassar a intenção do usuário para a camada de regra de negócio.
        const resultado = await automacaoImportarNoticiaService(portal);

        return response.status(200).json(resultado);
        
    } catch (error) {
        console.error("Erro ao importar notícias via RSS:", error);
        return response.status(500).json({
            error: "Erro interno ao tentar importar notícias via RSS."
        });
    }
};

export {
    automacaoImportarNoticiaController
};

