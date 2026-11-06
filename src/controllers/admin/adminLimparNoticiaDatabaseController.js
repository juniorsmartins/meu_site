import { adminLimparNoticiaDatabaseService } from "../../services/admin/adminLimparNoticiaDatabaseService.js";

const adminLimparNoticiaDatabaseController = async (request, response) => {
 
    try {
        const resultado = await adminLimparNoticiaDatabaseService();
        return response.status(200).json(resultado);

    } catch (error) {
        console.error("Erro ao realizar limpeza do banco:", error);
        return response.status(500).json({ error: "Erro ao realizar limpeza do banco de dados." });
    }
}

export {
    adminLimparNoticiaDatabaseController
};

