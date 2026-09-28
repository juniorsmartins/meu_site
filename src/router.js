import express from 'express';
import { noticiaConsultarPorIdController, noticiaBuscarController, noticiaCriarController } from './controllers/noticiaController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/", noticiaBuscarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.post("/", noticiaCriarController);

export { noticiaRouter };

