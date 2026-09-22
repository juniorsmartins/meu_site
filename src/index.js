import express from 'express';
import { nameRouter, userRouter } from './routes.js';
import { createRandomUsers } from './mocks/mocks.js';

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


app.get("/", (request, response) => {
    response.status(200).send("Olá, mundo!");
});

app.use("/name", nameRouter);
app.use("/user", userRouter);

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




