const MENSAGENS_ERRO = Object.freeze({ // Mensagens de erro padronizadas do sistema - utilizadas em toda a aplicação para consistência e manutenção facilitada

    AUTENTICAÇÃO: {
        TOKEN_NAO_FORNECIDO: "Acesso negado. Token de autenticação não fornecido.",
        TOKEN_INVALIDO: "Token inválido ou expirado. Faça login novamente.",
        ACESSO_ADMIN_OBRIGATÓRIO: "Acesso negado. Apenas administradores podem acessar o recurso."
    },

    USUARIO: {
        NAO_ENCONTRADO: "Usuário não encontrado.",
        EMAIL_DUPLICADO: "E-mail já cadastrado no sistema.",
        CAMPOS_OBRIGATÓRIOS: "Nome, e-mail e senha são obrigatórios.",
        ID_INVALIDO: "ID de usuário inválido."
    }
    // Outros domínios do sistema (noticias, comunicacao, etc.) podem entrar aqui futuramente
});

export { 
    MENSAGENS_ERRO 
};

