import { isValidObjectId } from "mongoose";
import { usuarioAtualizarService } from "../../services/usuarios/usuarioAtualizarService.js";

console.log("Arquivo usuarioAtualizarController.js carregado.");

const usuarioAtualizarController = async (request, response) => {

    try {
        const { id } = request.params;
        const usuario = request.body;
        const usuarioAutenticado = request.usuario;

        if (!isValidObjectId(id)) {
            return response.status(400).json({ error: "ID de usuário inválido." });
        }

        const usuarioAtualizado = await usuarioAtualizarService(id, usuario, usuarioAutenticado);

        if (!usuarioAtualizado) {
            return response.status(404).json({ error: "Usuário não encontrado para atualização." });
        }

        return response.status(200).json(usuarioAtualizado);
        
    } catch (error) {
        console.error("Erro no usuarioAtualizarController:", error.message);

        const status = error.statusCode || 500;
        const mensagem = status === 500
            ? "Ocorreu um erro interno ao atualizar o usuário."
            : error.message;

        return response.status(status).json({
            sucesso: false,
            mensagem
        });
    }
};

export {
    usuarioAtualizarController
};