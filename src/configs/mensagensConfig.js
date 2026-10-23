import { REGRAS_USUARIO } from './constantsConfig.js';

const MENSAGENS_ERRO = Object.freeze({ // Mensagens de erro padronizadas do sistema - utilizadas em toda a aplicação para consistência e manutenção facilitada

    GERAL: {
        ID_INVALIDO: "ID em formato inválido.",
        VALOR_UNICO_DUPLICADO: "Valor único já cadastrado no sistema.",
    },

    SERVIDOR: {
        ERRO_INTERNO: "Ocorreu um erro interno no servidor."
    },

    AUTENTICAÇÃO: {
        TOKEN_NAO_FORNECIDO: "Acesso negado. Token de autenticação não fornecido.",
        TOKEN_INVALIDO: "Token inválido ou expirado. Faça login novamente.",
        ACESSO_BLOQUEADO: "Acesso negado. Apenas administradores podem acessar o recurso.",
        ACESSO_BLOQUEADO_OUTRO_PERFIL: "Acesso negado. Você só pode usar esse recurso com seu próprio perfil.",
        ACESSO_BLOQUEADO_ADMIN_OBRIGATÓRIO: "Acesso negado. Apenas administradores podem acessar o recurso.",
        ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO: "Acesso negado. Apenas administradores podem alterar a função do usuário.",
        ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO: "Acesso negado. Não é possível deletar o único administrador existente no sistema."
    },

    USUARIO: {
        CAMPOS_OBRIGATÓRIOS: "Nome, e-mail e senha são obrigatórios.",
        NAO_ENCONTRADO: "Usuário não encontrado.",
        EMAIL_DUPLICADO: "E-mail já cadastrado no sistema.",
        ULTIMO_ADMIN: "Não é possível alterar a função do último administrador existente no sistema.",
        CAMPO_EMAIL_OBRIGATORIO: "O campo e-mail é obrigatório.",
        CAMPO_NOME_OBRIGATORIO: "O campo nome é obrigatório.",
        CAMPO_SENHA_OBRIGATORIO: "O campo senha é obrigatório.",
        CAMPO_NOME_MINIMO_CARACTERES: (min = REGRAS_USUARIO.NOME.MIN) => `O campo nome deve ter pelo menos ${min} caracteres.`,
        CAMPO_NOME_MAXIMO_CARACTERES: (max = REGRAS_USUARIO.NOME.MAX) => `O campo nome não pode ter mais de ${max} caracteres.`,
        CAMPO_SENHA_MINIMO_CARACTERES: (min = REGRAS_USUARIO.SENHA.MIN) => `O campo senha deve ter no mínimo ${min} caracteres.`,
        CAMPO_SENHA_MAXIMO_CARACTERES: (max = REGRAS_USUARIO.SENHA.MAX) => `O campo senha não pode ter mais de ${max} caracteres.`,
        CAMPO_EMAIL_FORMATO_INVALIDO: "O campo e-mail deve ter um formato válido."
    },

    ESTATISTICAS: {
        ERRO_AO_OBTER_DADOS: "Não foi possível obter as estatísticas no momento.", 
        FALHA_COM_API_BANCO_CENTRAL: "Falha ao comunicar com a API do Banco Central."
    }
});

const MENSAGENS_SUCESSO = Object.freeze({

    USUARIO: {
        CRIADO: "Usuário criado com sucesso.",
        ATUALIZADO: "Usuário atualizado com sucesso.",
        PESQUISADO: "Usuário pesquisado com sucesso.",
        BUSCADO: "Usuário buscado com sucesso.",
        DELETADO: "Usuário deletado com sucesso."
    }, 

    ESTATISTICAS: {
        CARREGADAS_COM_SUCESSO: "Indicadores econômicos carregados com sucesso."
    }
});

export { 
    MENSAGENS_ERRO,
    MENSAGENS_SUCESSO
};

