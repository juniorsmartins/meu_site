/**
 * Cliente HTTP genérico para requisições externas.
 * Responsável por buscar dados de qualquer URL, fazer logs brutos e tratar exceções.
 */
const httpClient = async (url) => {
    try {
        console.log(`[HTTP CLIENT] Realizando requisição GET para: ${url}`);
        
        const resposta = await fetch(url);
        console.log(`[HTTP CLIENT] Status Resposta (${url}): ${resposta.status}`);
        
        const textoBruto = await resposta.text();
        console.log(`[HTTP CLIENT] Texto bruto recebido (${url}):`, textoBruto.substring(0, 1000));

        if (!resposta.ok) {
            console.warn(`[HTTP CLIENT] A requisição retornou status não-ok: ${resposta.status}`);
            return { ok: false, status: resposta.status, data: null, textoBruto };
        }

        let dadosJson = null;
        try {
            dadosJson = JSON.parse(textoBruto);
        } catch (e) {
            console.warn(`[HTTP CLIENT] O conteúdo retornado não é um JSON válido.`);
        }

        return {
            ok: true,
            status: resposta.status,
            data: dadosJson,
            textoBruto
        };

    } catch (error) {
        console.error(`[HTTP CLIENT] Erro de rede ou fetch failed para ${url}:`, error.message);
        return { ok: false, status: 500, data: null, textoBruto: null };
    }
};

export { 
    httpClient 
};


