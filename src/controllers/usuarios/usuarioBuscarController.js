import { usuarioBuscarService } from '../../services/usuarios/usuarioBuscarService.js';
import { MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

const usuarioBuscarController = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const usuarioAutenticado = req.usuario;

        const usuarioBuscado = await usuarioBuscarService(id, usuarioAutenticado);

        return res.status(200).json({ 
            sucesso: true,
            mensagem: MENSAGENS_SUCESSO.USUARIO.BUSCADO,
            usuarioBuscado 
        });

    } catch (error) {
        next(error);
    }
};

export { 
    usuarioBuscarController 
};

