import { API_URL_NOTICIAS_CAPA } from './constantsConfig.js';

console.log("Arquivo index.js carregado.");

let promessaDadosCapa = null;

/**
 * Função singleton para buscar os dados unificados da Capa
 * Garantir que a requisição GET /api/v1/noticias/capa seja executada apenas 1 vez por carregamento de página.
 */
async function obterDadosCapa() {

    if (!promessaDadosCapa) {
        promessaDadosCapa = fetch(API_URL_NOTICIAS_CAPA, { cache: "no-store" })
            .then(res => {
                if (!res.ok) throw new Error(`Erro no status ${res.status}`);
                return res.json();
            })
            .catch(erro => {
                console.error("Erro ao carregar dados da Capa:", erro);
                promessaDadosCapa = null; // Libera para nova tentativa em caso de erro
                return null;
            });
    }
    return promessaDadosCapa;
}

export { obterDadosCapa };

