import { Agent, setGlobalDispatcher } from 'undici';

// Configura o dispatcher global do Undici (usado pelo fetch nativo) com timeouts maiores
setGlobalDispatcher(new Agent({
  connect: { timeout: 20_000 },     // 20s para estabelecer a conexão TCP
  keepAliveTimeout: 30_000,         // 30s de keep-alive
  keepAliveMaxTimeout: 60_000,
}));

const httpClient = async (url, tentativasMaximas = 5) => {
  for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa++) {
    try {
      console.log(`[HTTP CLIENT] Tentativa ${tentativa}/${tentativasMaximas} - GET: ${url}`);
      
      const resposta = await fetch(url, {
        headers: {
          // User-Agent de navegador para evitar bloqueios do WAF do IBGE
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        // Timeout total da requisição (aborta se demorar mais que 30s)
        signal: AbortSignal.timeout(30_000)
      });

      console.log(`[HTTP CLIENT] Status Resposta (${url}): ${resposta.status}`);
      
      const textoBruto = await resposta.text();
      console.log(`[HTTP CLIENT] Texto bruto recebido (${url}):`, textoBruto.substring(0, 200) + '...');

      if (!resposta.ok) {
        console.warn(`[HTTP CLIENT] A requisição retornou status não-ok: ${resposta.status}`);
        // Se for erro 5xx, vale a pena tentar de novo
        if (resposta.status >= 500 && tentativa < tentativasMaximas) {
          throw new Error(`Status ${resposta.status}`);
        }
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
      console.error(`[HTTP CLIENT] Erro na tentativa ${tentativa} para ${url}:`, error.message);
      
      // Se for a última tentativa, retorna falha
      if (tentativa === tentativasMaximas) {
        return { ok: false, status: 500, data: null, textoBruto: null };
      }
      
      // Espera 2 segundos antes de tentar novamente
      console.log(`[HTTP CLIENT] Aguardando 2s para retentar...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export { httpClient };

