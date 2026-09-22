import express from 'express';
import { createRandomUser } from './mocks/mocks.js';

console.log("Servidor iniciado");

console.log(createRandomUser());

const app = express();

app.get("/", (request, response) => {

    response.status(200).send("Olá, mundo!");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

