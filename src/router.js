import express from 'express';
import { noticiaConsultarPorIdController, noticiaBuscarController, noticiaCriarController } from './controllers/noticiaController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.get("/", noticiaBuscarController);
noticiaRouter.post("/", noticiaCriarController);

export { noticiaRouter };

