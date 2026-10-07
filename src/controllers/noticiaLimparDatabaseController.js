import { noticiaLimparDatabaseService } from "../services/noticiaLimparDatabaseService.js";

const noticiaLimparDatabaseController = async (request, response) => {
 
    try {
        const resultado = await noticiaLimparDatabaseService();
        return response.status(200).json(resultado);

    } catch (error) {
        console.error("Erro ao realizar limpeza do banco:", error);
        return response.status(500).json({ error: "Erro ao realizar limpeza do banco de dados." });
    }
}

export {
    noticiaLimparDatabaseController
};

