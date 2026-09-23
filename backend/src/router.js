import express from 'express';
import { createRandomUser, createRandomUsers } from './mocks/mocks.js';
import { noticiasGetController } from './noticia/controller.js';

const nameRouter = express.Router();
const userRouter = express.Router();
const noticiasRouter = express.Router();

noticiasRouter.get("/", noticiasGetController);

nameRouter.get("/", (request, response) => {
    response.status(200).send("Olá, galáxia!");
});

userRouter.get("/", (request, response) => {
    response.status(200).send(createRandomUser());
});


export { nameRouter, userRouter, noticiasRouter };

