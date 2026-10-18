import { usuarioBuscarService } from '../../services/usuarios/usuarioBuscarService.js';

const usuarioBuscarController = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const usuarioAutenticado = req.usuario;

        const usuarioBuscado = await usuarioBuscarService(id, usuarioAutenticado);

        return res.status(200).json(usuarioBuscado);

    } catch (error) {
        console.error("Erro no usuarioBuscarController:", error.message);
        next(error);
    }
};

export { 
    usuarioBuscarController 
};

