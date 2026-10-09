import express from 'express';
import cors from 'cors';
import { connectToMongo } from './database/index.js';
import { 
    noticiaRouter, 
    newsletterRouter, 
    contatoLeitorRouter, 
    adminRouter,
    manutencaoRouter, 
    automacaoRouter
} from './router.js';

const app = express(); /* Cria uma instância do aplicativo Express */

/* Middleware para parsear JSON. Necessário para que o corpo das requisições POST seja interpretado corretamente. */
app.use(express.json()); 

/* Middleware para parsear JSON sem modo estrito */
/* app.use(express.json({ strict: false })); */

// Configuração do middleware CORS. 
// Com asterisco, permite requisições de qualquer origem (CORS)
app.use(cors({ origin: '*' })); 

// Middleware para garantir que a conexão com o MongoDB seja estabelecida antes de processar as requisições
app.use(async (request, response, next) => {
    try {
        await connectToMongo(); // Conecta ao MongoDB antes de processar a requisição
        next(); // Chama o próximo middleware ou rota após a conexão com o MongoDB ser estabelecida com sucesso

    } catch (error) {
        console.error("Erro na conexão com o MongoDB: ", error);
        response.status(500).json({ error: "Erro na conexão com o MongoDB" });
    }
});

// Definição das rotas da API (Sem o prefixo /api, pois [...all].js já removeu)
app.use("/noticias", noticiaRouter);
app.use("/newsletter", newsletterRouter); 
app.use("/contato-leitor", contatoLeitorRouter);
app.use("/admin", adminRouter);
app.use("/manutencao", manutencaoRouter);
app.use("/automacao", automacaoRouter);

// Exportação padrão necessária para Serverless na Vercel
export default app;
// Exportação nomeada do aplicativo Express, útil para testes ou outros usos fora do ambiente Serverless
export { app };


