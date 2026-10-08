import { automacaoImportarNoticiaService } from "../services/automacaoImportarNoticiaService.js";

const automacaoImportarNoticiaController = async (request, response) => {

    try {
        const resultado = await automacaoImportarNoticiaService();
        return response.status(200).json(resultado);
        
    } catch (error) {
        console.error("Erro ao importar notícias da Agência Brasil:", error);
        return response.status(500).json({
            error: "Erro interno ao tentar importar notícias via RSS."
        });
    }
};

export {
    automacaoImportarNoticiaController
};


