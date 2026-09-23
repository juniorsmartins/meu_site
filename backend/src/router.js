import express from 'express';
import { createRandomUser, createRandomUsers } from './mocks/mocks.js';
import { noticiasGetController, noticiasPostController } from './noticia/controller.js';

const noticiasRouter = express.Router();

noticiasRouter.get("/", noticiasGetController);
noticiasRouter.post("/", noticiasPostController);

export { noticiasRouter };

