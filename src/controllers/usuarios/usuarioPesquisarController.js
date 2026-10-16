import { usuarioPesquisarService } from "../../services/usuarios/usuarioPesquisarService.js";

const usuarioPesquisarController = async (request, response, next) => {
    
    try {
        const queryParams = request.query;
        const usuarioAutenticado = request.usuario;

        const resultadoPaginado = await usuarioPesquisarService(queryParams, usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            ...resultadoPaginado
        });

    } catch (error) {
        console.error("Erro no usuarioPesquisarController:", error.message);
        next(error); // Encaminha para o middleware errorHandler global
    }
};

export { 
    usuarioPesquisarController 
};

