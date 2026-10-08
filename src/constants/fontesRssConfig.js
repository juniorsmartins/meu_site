import { normalizarNoticiaAgenciaBrasil } from '../helpers/rssParsers/agenciaBrasilParser.js';
import { normalizarNoticiaAgenciaCamara } from '../helpers/rssParsers/agenciaCamaraParser.js';
import { normalizarNoticiaTse } from '../helpers/rssParsers/tseParser.js';

/**
 * Registro de todas as fontes de RSS com suas URLs e funções de normalização específicas.
 */
const FONTES_RSS = [

    // =========================================================================
    // AGÊNCIA CÂMARA DE NOTÍCIAS
    // =========================================================================
    {
        chave: "CAMARA_ADMINISTRACAO_PUBLICA",
        nome: "Câmara - Administração Pública",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ADMINISTRACAO-PUBLICA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "geral")
    },
    {
        chave: "CAMARA_ASSISTENCIA_SOCIAL",
        nome: "Câmara - Assistência Social",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ASSISTENCIA-SOCIAL",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "geral")
    },
    {
        chave: "CAMARA_MEIO_AMBIENTE",
        nome: "Câmara - Meio Ambiente",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/MEIO-AMBIENTE",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "meio ambiente")
    },
    {
        chave: "CAMARA_EDUCACAO_E_CULTURA",
        nome: "Câmara - Educação e Cultura",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/EDUCACAO-E-CULTURA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "geral")
    },
    {
        chave: "CAMARA_CIDADES",
        nome: "Câmara - Cidades",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/CIDADES",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "geral")
    },
    {
        chave: "CAMARA_RELACOES_EXTERIORES",
        nome: "Câmara - Relações Exteriores",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/RELACOES-EXTERIORES",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "internacional")
    },
    {
        chave: "CAMARA_TRANSPORTE_E_TRANSITO",
        nome: "Câmara - Transporte e Trânsito",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/TRANSPORTE-E-TRANSITO",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_DIREITOS_HUMANOS",
        nome: "Câmara - Direitos Humanos",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/DIREITOS-HUMANOS",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "política")
    },
    {
        chave: "CAMARA_CONSUMIDOR",
        nome: "Câmara - Consumidor",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/CONSUMIDOR",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_ESPORTES",
        nome: "Câmara - Esportes",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ESPORTES",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "esportes")
    },
    {
        chave: "CAMARA_TRABALHO_E_PREVIDENCIA",
        nome: "Câmara - Trabalho e Previdência",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/TRABALHO-E-PREVIDENCIA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_SAUDE",
        nome: "Câmara - Saúde",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/SAUDE",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "saúde")
    },
    {
        chave: "CAMARA_DIREITO_E_JUSTICA",
        nome: "Câmara - Direito e Justiça",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/DIREITO-E-JUSTICA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "polícia")
    },
    {
        chave: "CAMARA_TURISMO",
        nome: "Câmara - Turismo",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/TURISMO",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "turismo")
    },
    {
        chave: "CAMARA_AGROPECUARIA",
        nome: "Câmara - Agropecuária",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/AGROPECUARIA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_SEGURANCA",
        nome: "Câmara - Segurança",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/SEGURANCA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "polícia")
    },
    {
        chave: "CAMARA_INDUSTRIA_E_COMERCIO",
        nome: "Câmara - Indústria e Comércio",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/INDUSTRIA-E-COMERCIO",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_ECONOMIA",
        nome: "Câmara - Economia",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ECONOMIA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "economia")
    },
    {
        chave: "CAMARA_CIENCIA_E_TECNOLOGIA",
        nome: "Câmara - Ciência e Tecnologia",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/CIENCIA-E-TECNOLOGIA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "tecnologia")
    },
    {
        chave: "CAMARA_POLITICA",
        nome: "Câmara - Política",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/POLITICA",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "política")
    },
    {
        chave: "CAMARA_ELEICOES",
        nome: "Câmara - Eleições",
        url: "https://www.camara.leg.br/noticias/rss/dinamico/ELEICOES",
        normalizador: (item) => normalizarNoticiaAgenciaCamara(item, "política")
    },

    // =========================================================================
    // AGÊNCIA BRASIL (EBC) - POR EDITORIAS
    // =========================================================================
    {
        chave: "AGENCIA_BRASIL_GERAL",
        nome: "Agência Brasil - Geral",
        url: "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "geral")
    },
    {
        chave: "AGENCIA_BRASIL_DIREITOS_HUMANOS",
        nome: "Agência Brasil - Direitos Humanos",
        url: "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "política")
    },
    {
        chave: "AGENCIA_BRASIL_EDUCACAO",
        nome: "Agência Brasil - Educação",
        url: "https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "geral")
    },
    {
        chave: "AGENCIA_BRASIL_SAUDE",
        nome: "Agência Brasil - Saúde",
        url: "https://agenciabrasil.ebc.com.br/rss/saude/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "saúde")
    },
    {
        chave: "AGENCIA_BRASIL_INTERNACIONAL",
        nome: "Agência Brasil - Internacional",
        url: "https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "internacional")
    },
    {
        chave: "AGENCIA_BRASIL_ESPORTES",
        nome: "Agência Brasil - Esportes",
        url: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "esportes")
    },
    {
        chave: "AGENCIA_BRASIL_JUSTICA",
        nome: "Agência Brasil - Justiça",
        url: "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "polícia")
    },
    {
        chave: "AGENCIA_BRASIL_ECONOMIA",
        nome: "Agência Brasil - Economia",
        url: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "economia")
    },
    {
        chave: "AGENCIA_BRASIL_POLITICA",
        nome: "Agência Brasil - Política",
        url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
        normalizador: (item) => normalizarNoticiaAgenciaBrasil(item, "política")
    },

    // =========================================================================
    // Tribunal Superior Eleitoral (TSE) 
    // =========================================================================
    {
        chave: "TSE_NOTICIAS",
        nome: "TSE - Notícias",
        url: "https://www.tse.jus.br/comunicacao/noticias/rss",
        normalizador: (item) => normalizarNoticiaTse(item, "política")
    }
];

export { 
    FONTES_RSS 
};

