import { noticiaDeletarPorIdService } from '../services/noticiaDeleteService.js';

const noticiaDeletarPorIdController = async (request, response) => {

    try {

        const { id } = request.params;
        const noticiaDeletada = await noticiaDeletarPorIdService(id);

        if (!noticiaDeletada) {
            return response.status(404).send({ error: "Notícia não encontrada para exclusão." });
        }

        response.status(200).send({ mensagem: "Notícia excluída com sucesso.", noticia: noticiaDeletada });

    } catch (error) {
        response.status(400).send({ error: "Erro ao excluir notícia." });
    }
}

export { noticiaDeletarPorIdController };

