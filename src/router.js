import express from 'express';
import { noticiaBuscarController, noticiaCriarController } from './controllers/noticiaController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/", noticiaBuscarController);
noticiaRouter.post("/", noticiaCriarController);

export { noticiaRouter };

