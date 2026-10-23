import https from 'https';
// Força o Node a priorizar conexões IPv4
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

/**
 * Cliente HTTP genérico para requisições externas.
 * Responsável por buscar dados de qualquer URL, fazer logs brutos e tratar exceções.
 */
const httpClient = async (url) => {
    try {
        console.log(`[HTTP CLIENT] Realizando requisição GET para: ${url}`);
        
        // Usando fetch nativo do Node (mais estável na Vercel do que o node-fetch)
        const resposta = await fetch(url, {
            headers: {
                // User-Agent de navegador real para evitar bloqueios de WAF do IBGE
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            // Timeout de 15 segundos usando AbortSignal nativo do Node
            signal: AbortSignal.timeout(15000)
        });

        console.log(`[HTTP CLIENT] Status Resposta (${url}): ${resposta.status}`);
        
        const textoBruto = await resposta.text();
        console.log(`[HTTP CLIENT] Texto bruto recebido (${url}):`, textoBruto.substring(0, 700));

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
        // Loga a causa raiz do erro de rede (ex: ECONNREFUSED, ENOTFOUND, timeout)
        console.error(`[HTTP CLIENT] Erro de rede ou fetch failed para ${url}:`, error.message);
        if (error.cause) {
            console.error(`[HTTP CLIENT] Causa detalhada:`, error.cause);
        }
        return { ok: false, status: 500, data: null, textoBruto: null };
    }
};

export { 
    httpClient 
};

