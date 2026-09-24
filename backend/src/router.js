import express from 'express';
import { noticiasGetController, noticiasPostController } from './controllers/noticiaController.js';

const noticiasRouter = express.Router();

noticiasRouter.get("/", noticiasGetController);
noticiasRouter.post("/", noticiasPostController);

export { noticiasRouter };

