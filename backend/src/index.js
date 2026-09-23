import express from 'express';
import cors from 'cors';
import { noticiasRouter } from './router.js';
import { createRandomUsers } from './mocks/mocks.js';

const app = express(); /* Cria uma instância do aplicativo Express */
const PORT = 3000;

app.use(express.json()); /* Middleware para parsear JSON. Necessário para que o corpo das requisições POST seja interpretado corretamente. */

app.use(
    cors({
        origin: '*', /* Permite requisições de qualquer origem */
    })
); /* Middleware para habilitar CORS */

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use("/noticias", noticiasRouter);

app.get("/", (request, response) => {
    response.status(200).send("Olá, mundo!");
});

app.get("/multi", (request, response) => {

    try {
        const quantia = request.query.quantia ?? 2;
        response.status(200).json(createRandomUsers(quantia));
    } catch (error) {
        response.status(400).json({
            error: 'Parametro "quantia" precisa ser um numero inteiro maior que 0',
        });
    }
});

app.get("/multi/:quantia", (request, response) => {

    try {
        const quantia = request.params.quantia ?? 2;
        response.status(200).json(createRandomUsers(quantia));
    } catch (error) {
        response.status(400).json({
            error: 'Parametro "quantia" precisa ser um numero inteiro maior que 0',
        });
    }
});

app.post("/criar", (request, response) => {

    const { password } = request.body;

    if(password.length >= 5) {
        response.status(200).send("Senha válida: " + password);
    } else {
        response.status(400).send("Senha inválida");
    }
});


