console.log("Arquivo constantsConfig.js carregado.");

// Configurações gerais do site
const SITE_CONFIG = {
    nome: "Gajeiro",
    slogan: "Olhos no horizonte, pés nos fatos",
    fundador: "Junior Martins",
    cargoFundador: "Fundador & Diretor Geral",
    emailRedacao: "gajeiro.jor@gmail.com",
    localizacaoPadrao: "Cuiabá - Mato Grosso, Brasil",
    horarioAtendimento: "Segunda a Sexta, das 08h às 17h"
};

// Editorias disponíveis no sistema
const EDITORIAS = [
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

// Limite máximo de notícias mantidas no banco de dados
const LIMITE_MAXIMO_NOTICIAS_DATABASE = 120;

// Limite de notícias exibidas por página
const LIMITE_NOTICIAS_POR_PAGINA_ADMIN = 15;

export { 
    EDITORIAS,
    SITE_CONFIG,
    LIMITE_MAXIMO_NOTICIAS_DATABASE, 
    LIMITE_NOTICIAS_POR_PAGINA_ADMIN
};

