import { Usuario } from '../models/usuarioSchema.js';
import jwt from 'jsonwebtoken';

console.log("Arquivo authService.js carregado.");

const loginService = async (email, senha) => {

    // 1. Validação simples de preenchimento na regra de negócio
    if (!email || !senha) {
        const error = new Error("Informe o e-mail e a senha para acessar.");
        error.statusCode = 400;
        throw error;
    }

    // 2. Busca o usuário pelo e-mail com a senha selecionada
    const usuario = await Usuario.findOne(
        { email: email.toLowerCase() }
    ).select('+senha');

    if (!usuario) {
        const error = new Error("E-mail ou senha incorretos.");
        error.statusCode = 401;
        throw error;
    }

    // 3. Valida a senha usando o método do Schema
    const senhaValida = await usuario.compararSenha(senha);
    if (!senhaValida) {
        const error = new Error("E-mail ou senha incorretos.");
        error.statusCode = 401;
        throw error;
    }

    // 4. Criação do Payload e Assinatura do Token JWT
    const payload = {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5. Retorna o token e os dados públicos formatados do usuário
    return {
        token,
        usuario: {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            funcao: usuario.funcao
        }
    };
}

export { loginService };

