import express from 'express';
import { nameRouter } from './routes.js';

const app = express();

app.get("/", (request, response) => {
    response.status(200).send("Olá, mundo!");
});

app.use("/name", nameRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});



