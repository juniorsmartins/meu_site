import { usuarioDeletarService } from '../../services/usuarios/usuarioDeletarService.js';

const usuarioDeletarController = async (request, response, next) => {

    try {
        const { id } = request.params;
        const usuarioAutenticado = request.usuario; // Usuário autenticado injetado pelo middleware de autenticação

        const resultado = await usuarioDeletarService(id, usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            ...resultado
        });

    } catch (error) {
        console.error("Erro no usuarioDeletarController:", error.message);
        next(error); // Encaminha para o Global Error Handler
    }
};

export { 
    usuarioDeletarController 
};

