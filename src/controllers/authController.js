import { loginService } from '../services/authService.js';

// Controlador responsável por lidar com as requisições de login do sistema
const loginController = async (request, response) => {

    try {
        const { email, senha } = request.body;

        // Chama a camada de serviço
        const resultado = await loginService(email, senha);

        return response.status(200).json({
            sucesso: true,
            mensagem: "Autenticação realizada com sucesso!",
            token: resultado.token,
            usuario: resultado.usuario
        });

    } catch (error) {

        console.error("Erro no AuthController.login:", error.message);
        
        // Captura o statusCode retornado pelo serviço ou define 500 como fallback
        const status = error.statusCode || 500;
        const mensagem = status === 500 
            ? "Ocorreu um erro interno ao processar seu login." 
            : error.message;

        return response.status(status).json({
            sucesso: false,
            mensagem
        });
    }
}

export { loginController };

