import jwt from 'jsonwebtoken';

// Middleware responsável por autenticar o token JWT nas requisições HTTP.
function autenticarToken(request, response, next) {

    // 1. Busca o cabeçalho Authorization da requisição HTTP
    const authHeader = req.headers['authorization'];
    
    // O padrão do cabeçalho é: "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) { // Se não houver token, retorna erro 401 (Não autorizado)
        return response.status(401).json({ 
            sucesso: false, 
            mensagem: "Acesso negado. Token de autenticação não fornecido." 
        });
    }

    try {

        // 2. Valida se o token foi assinado com a nossa chave secreta e se está dentro da validade
        const tokenDecodificado = jwt.verify(
            token, 
            process.env.JWT_SECRET // Chave secreta usada para assinar e verificar o JWT. 
        );

        // 3. Anexa os dados do usuário decodificado à requisição (req.usuario)
        request.usuario = tokenDecodificado;

        // 4. Libera a requisição para continuar para a rota final
        next();

    } catch (error) {
        console.error("Erro na verificação do JWT:", error.message);
        return response.status(403).json({ 
            sucesso: false, 
            mensagem: "Token inválido ou expirado. Faça login novamente." 
        });
    }
}

export { autenticarToken };

