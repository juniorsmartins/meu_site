import express from 'express';
import cors from 'cors';
import { noticiaRouter } from './router.js';

const app = express(); /* Cria uma instância do aplicativo Express */

app.use(express.json()); /* Middleware para parsear JSON. Necessário para que o corpo das requisições POST seja interpretado corretamente. */

app.use(
    cors({
        origin: '*', /* Permite requisições de qualquer origem */
    })
); /* Middleware para habilitar CORS */

app.use("/noticias", noticiaRouter);

app.get("/", (request, response) => {
    response.status(200).send("Olá, mundo!");
});

export { app };



