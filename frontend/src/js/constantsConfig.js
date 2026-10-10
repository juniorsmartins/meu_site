// URL base centralizada da API
const API_URL_NOTICIAS = '/api/v1/noticias';
const API_URL_CONTATO_LEITOR = '/api/v1/contato-leitor';
const API_URL_NEWSLETTER = '/api/v1/newsletter';
const API_URL_ADMIN_METRICAS = '/api/v1/admin/metricas';
const API_URL_ADMIN_IMPORTAR_NOTICIA = '/api/v1/admin/automacao/importar-noticias';
const API_URL_ADMIN_LIMPAR_DATABASE = '/api/v1/admin/manutencao/limpar-database';

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

export { 
    API_URL_NOTICIAS, 
    API_URL_CONTATO_LEITOR,
    API_URL_NEWSLETTER,
    API_URL_ADMIN_METRICAS,
    API_URL_ADMIN_IMPORTAR_NOTICIA,
    API_URL_ADMIN_LIMPAR_DATABASE,
    OPCOES_EDITORIA, 
    SITE_CONFIG 
};


