const MENSAGENS_ERRO = Object.freeze({ // Mensagens de erro padronizadas do sistema - utilizadas em toda a aplicação para consistência e manutenção facilitada

    AUTENTICAÇÃO: {
        TOKEN_NAO_FORNECIDO: "Acesso negado. Token de autenticação não fornecido.",
        TOKEN_INVALIDO: "Token inválido ou expirado. Faça login novamente.",
        ACESSO_BLOQUEADO_ADMIN_OBRIGATÓRIO: "Acesso negado. Apenas administradores podem acessar o recurso.",
        ACESSO_BLOQUEADO_ATUALIZAR_OUTRO_PERFIL: "Acesso negado. Você só pode atualizar o próprio perfil.",
        ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO: "Acesso negado. Apenas administradores podem alterar a função do usuário.",
        ACESSO_BLOQUEADO_BUSCAR_OUTRO_PERFIL: "Acesso negado. Você só pode buscar o próprio perfil.",
        ACESSO_BLOQUEADO_DELETAR_OUTRO_PERFIL: "Acesso negado. Você só pode deletar o próprio perfil.",
        ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO: "Acesso negado. Não é possível deletar o único administrador existente no sistema."
    },

    USUARIO: {
        CAMPOS_OBRIGATÓRIOS: "Nome, e-mail e senha são obrigatórios.",
        NAO_ENCONTRADO: "Usuário não encontrado.",
        EMAIL_DUPLICADO: "E-mail já cadastrado no sistema.",
        ID_INVALIDO: "ID de usuário inválido."
    }
    // Outros domínios do sistema (noticias, comunicacao, etc.) podem entrar aqui futuramente
});

const MENSAGENS_SUCESSO = Object.freeze({

    USUARIO: {
        BUSCADO: "Usuário buscado com sucesso.",
        DELETADO: "Usuário deletado com sucesso."
    }
});

export { 
    MENSAGENS_ERRO,
    MENSAGENS_SUCESSO
};

