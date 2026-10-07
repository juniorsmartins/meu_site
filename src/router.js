import express from 'express';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';
import { contatoLeitorCriarController } from './controllers/contatoLeitorCriarController.js';
import { manutencaoLimparDatabaseController } from './controllers/manutencaoLimparDatabaseController.js';

const noticiaRouter = express.Router();
const newsletterRouter = express.Router();
const contatoLeitorRouter = express.Router();
const manutencaoRouter = express.Router();

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

// MANUTENÇÃO - Rota para limpar banco de dados 
manutencaoRouter.delete("/limpar-database", manutencaoLimparDatabaseController);

export { 
    noticiaRouter, 
    newsletterRouter, 
    contatoLeitorRouter, 
    manutencaoRouter 
};

