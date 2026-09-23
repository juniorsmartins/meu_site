import express from 'express';
import { createRandomUser, createRandomUsers } from './mocks/mocks.js';

const nameRouter = express.Router();
const userRouter = express.Router();

nameRouter.get("/", (request, response) => {
    response.status(200).send("Olá, galáxia!");
});

userRouter.get("/", (request, response) => {
    response.status(200).send(createRandomUser());
});

export { nameRouter, userRouter };

