import express from 'express';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';
import { contatoLeitorCriarController } from './controllers/contatoLeitorCriarController.js';
import { noticiaLimparDatabaseController } from './controllers/noticiaLimparDatabaseController.js';

const noticiaRouter = express.Router();
const newsletterRouter = express.Router();
const contatoLeitorRouter = express.Router();

// MANUTENÇÃO - Rota para limpar banco de dados de notícias
noticiaRouter.delete("/limpar", noticiaLimparDatabaseController);

// Rotas de Notícias
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.put("/:id", noticiaAtualizarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

// Rotas de Newsletter
newsletterRouter.post("/", newsletterCriarController);

// Rotas de Contato do Leitor
contatoLeitorRouter.post("/", contatoLeitorCriarController);

export { noticiaRouter, newsletterRouter, contatoLeitorRouter };

