const MENSAGENS_ERRO = Object.freeze({ // Mensagens de erro padronizadas do sistema - utilizadas em toda a aplicação para consistência e manutenção facilitada

    GERAL: {
        ID_INVALIDO: "ID em formato inválido.",
    },

    SERVIDOR: {
        ERRO_INTERNO: "Ocorreu um erro interno no servidor."
    },

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
        ID_INVALIDO: "ID de usuário inválido.",
        CAMPO_EMAIL_OBRIGATORIO: "O campo e-mail é obrigatório.",
        CAMPO_NOME_OBRIGATORIO: "O campo nome é obrigatório.",
        CAMPO_SENHA_OBRIGATORIO: "O campo senha é obrigatório.",
        CAMPO_NOME_MINIMO_CARACTERES: "O campo nome deve ter pelo menos 2 caracteres.",
        CAMPO_SENHA_MINIMO_CARACTERES: "O campo senha deve ter no mínimo 3 caracteres.",
        CAMPO_EMAIL_FORMATO_INVALIDO: "O campo e-mail deve ter um formato válido."
    }
    // Outros domínios do sistema (noticias, comunicacao, etc.) podem entrar aqui futuramente
});

const MENSAGENS_SUCESSO = Object.freeze({

    USUARIO: {
        CRIADO: "Usuário criado com sucesso.",
        ATUALIZADO: "Usuário atualizado com sucesso.",
        PESQUISADO: "Usuário pesquisado com sucesso.",
        BUSCADO: "Usuário buscado com sucesso.",
        DELETADO: "Usuário deletado com sucesso."
    }
});

export { 
    MENSAGENS_ERRO,
    MENSAGENS_SUCESSO
};

