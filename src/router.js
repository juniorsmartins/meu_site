import express from 'express';
import { noticiaCriarController } from './controllers/noticiaCriarController.js';
import { noticiaPesquisarController } from './controllers/noticiaPesquisarController.js';
import { noticiaConsultarPorIdController } from './controllers/noticiaConsultarController.js';
import { noticiaAtualizarController } from './controllers/noticiaAtualizarController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';
import { newsletterCriarController } from './controllers/newsletterCriarController.js';
import { contatoLeitorCriarController } from './controllers/contatoLeitorCriarController.js';
import { adminMetricasController } from './controllers/adminMetricasController.js';
import { manutencaoLimparDatabaseController } from './controllers/manutencaoLimparDatabaseController.js';
import { automacaoImportarNoticiaController } from './controllers/automacaoImportarNoticiaController.js';

const noticiaRouter = express.Router();
const newsletterRouter = express.Router();
const contatoLeitorRouter = express.Router();
const adminRouter = express.Router();
// const manutencaoRouter = express.Router();
// const automacaoRouter = express.Router();

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

// ADMIN - Rotas de administração do sistema
adminRouter.get("/metricas", adminMetricasController);
adminRouter.delete("/manutencao/limpar-database", manutencaoLimparDatabaseController);
adminRouter.post("/automacao/importar-noticias", automacaoImportarNoticiaController);

// MANUTENÇÃO - Rota para limpar banco de dados 
// manutencaoRouter.delete("/manutencao/limpar-database", manutencaoLimparDatabaseController);

// AUTOMAÇÃO - Rota para disparar a automação de RSS
// automacaoRouter.post("/automacao/importar-noticias", automacaoImportarNoticiaController);

export { 
    noticiaRouter, 
    newsletterRouter, 
    contatoLeitorRouter, 
    adminRouter
    // ,
    // manutencaoRouter,
    // automacaoRouter
};


