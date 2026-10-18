import { usuarioPesquisarService } from "../../services/usuarios/usuarioPesquisarService.js";
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioPesquisarController = async (request, response, next) => {
    
    try {
        const queryParams = request.query;
        const usuarioAutenticado = request.usuario;

        const resultadoPaginado = await usuarioPesquisarService(queryParams, usuarioAutenticado);

        return response.status(200).json({
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.PESQUISADO,
            ...resultadoPaginado
        });

    } catch (error) {
        next(error); 
    }
};

export { 
    usuarioPesquisarController 
};

