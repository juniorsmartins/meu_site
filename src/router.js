import express from 'express';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';
import { contatoLeitorCriarController } from './controllers/contatoLeitorCriarController.js';
import { noticiaLimparDatabaseController } from './controllers/noticiaLimparDatabaseController.js';

// Rotas de Notícias
const noticiaRouter = express.Router();
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.put("/:id", noticiaAtualizarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

// MANUTENÇÃO - Rota para limpar banco de dados de notícias
noticiaRouter.delete("/limpar", noticiaLimparDatabaseController);

// Rotas de Newsletter
const newsletterRouter = express.Router();
newsletterRouter.post("/", newsletterCriarController);

// Rotas de Contato do Leitor
const contatoLeitorRouter = express.Router();
contatoLeitorRouter.post("/", contatoLeitorCriarController);

export { noticiaRouter, newsletterRouter, contatoLeitorRouter };

