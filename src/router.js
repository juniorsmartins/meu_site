import express from 'express';
import { adminMetricasController } from './controllers/adminMetricasController.js';
import { manutencaoLimparDatabaseController } from './controllers/manutencaoLimparDatabaseController.js';
import { automacaoImportarNoticiaController } from './controllers/automacaoImportarNoticiaController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';
import { contatoLeitorCriarController } from './controllers/contatoLeitorCriarController.js';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';

const adminRouter = express.Router();
const comunicacaoRouter = express.Router();
const noticiaRouter = express.Router();

// ADMIN - Rotas de administração do sistema
adminRouter.get("/metricas", adminMetricasController);
adminRouter.delete("/manutencao/limpar-database", manutencaoLimparDatabaseController);
adminRouter.post("/automacao/importar-noticias", automacaoImportarNoticiaController);

// COMUNICAÇÃO - Rotas de comunicação (Newsletter e Contato do Leitor)
comunicacaoRouter.post("/newsletter", newsletterCriarController);
comunicacaoRouter.post("/contato-leitor", contatoLeitorCriarController);

// NOTICIAS - Rotas de Notícias
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.put("/:id", noticiaAtualizarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

export { 
    adminRouter,
    comunicacaoRouter,
    noticiaRouter
};

