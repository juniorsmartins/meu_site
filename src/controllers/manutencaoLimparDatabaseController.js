import { manutencaoLimparDatabaseService } from "../services/manutencaoLimparDatabaseService.js";

const manutencaoLimparDatabaseController = async (request, response) => {
 
    try {
        const resultado = await manutencaoLimparDatabaseService();
        return response.status(200).json(resultado);

    } catch (error) {
        console.error("Erro ao realizar limpeza do banco:", error);
        return response.status(500).json({ error: "Erro ao realizar limpeza do banco de dados." });
    }
}

export {
    manutencaoLimparDatabaseController
};

