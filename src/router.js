import express from 'express';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

export { noticiaRouter };

