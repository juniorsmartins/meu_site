import express from 'express';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';

const noticiaRouter = express.Router();

// Rotas de Notícias
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.put("/:id", noticiaAtualizarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

// Rota exclusiva para Newsletter
const newsletterRouter = express.Router();
newsletterRouter.post("/", newsletterCriarController);

export { noticiaRouter, newsletterRouter };

