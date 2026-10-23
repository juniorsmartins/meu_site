// URL base centralizada da API
const API_URL_USUARIOS = '/api/v1/usuarios';
const API_URL_ADMIN_METRICAS = '/api/v1/admin/metricas';
const API_URL_ESTATISTICAS = '/api/v1/estatisticas';
const API_URL_ADMIN_IMPORTAR_NOTICIA = '/api/v1/admin/automacao/importar-noticias';
const API_URL_ADMIN_LIMPAR_DATABASE = '/api/v1/admin/manutencao/limpar-database';
const API_URL_COMUNICACAO_NEWSLETTER = '/api/v1/comunicacao/newsletter';
const API_URL_COMUNICACAO_CONTATO_LEITOR = '/api/v1/comunicacao/contato-leitor';
const API_URL_NOTICIAS_CAPA = '/api/v1/noticias/capa';
const API_URL_NOTICIAS = '/api/v1/noticias';

// Dados Centrais do Portal (Fonte Única de Verdade)
const SITE_CONFIG = {
    nome: "Gajeiro",
    slogan: "Olhos no horizonte, pés nos fatos",
    fundador: "Junior Martins",
    cargoFundador: "Fundador & Diretor Geral",
    emailRedacao: "gajeiro.jor@gmail.com",
    localizacaoPadrao: "Cuiabá - Mato Grosso, Brasil",
    horarioAtendimento: "Segunda a Sexta, das 08h às 17h"
};

const FUNCOES_USUARIO = Object.freeze({
    ADMIN: "admin",
    EDITOR: "editor",
    JORNALISTA: "jornalista",
    LEITOR: "leitor"
});

// Lista única das editorias usadas no frontend
const OPCOES_EDITORIA = [
    "geral",
    "política", 
    "esportes", 
    "entretenimento", 
    "tecnologia", 
    "saúde", 
    "economia", 
    "opinião", 
    "editorial", 
    "turismo", 
    "cultura",
    "polícia",
    "meio ambiente", 
    "internacional"
];

// Limite de notícias exibidas por página
const LIMITE_NOTICIAS_POR_PAGINA_ADMIN = 15;
const LIMITE_USUARIOS_POR_PAGINA = 15;

export { 
    API_URL_USUARIOS,
    API_URL_ADMIN_METRICAS,
    API_URL_ADMIN_IMPORTAR_NOTICIA,
    API_URL_ADMIN_LIMPAR_DATABASE,
    API_URL_COMUNICACAO_CONTATO_LEITOR,
    API_URL_COMUNICACAO_NEWSLETTER,
    API_URL_NOTICIAS_CAPA,
    API_URL_NOTICIAS, 
    API_URL_ESTATISTICAS,
    OPCOES_EDITORIA, 
    SITE_CONFIG,
    FUNCOES_USUARIO,
    LIMITE_NOTICIAS_POR_PAGINA_ADMIN,
    LIMITE_USUARIOS_POR_PAGINA
};


