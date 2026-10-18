import express from 'express';
import { loginController } from './controllers/authController.js';
import { autenticarToken } from './middlewares/autenticarToken.js';
import { usuarioCriarController } from './controllers/usuarios/usuarioCriarController.js';
import { usuarioPesquisarController } from './controllers/usuarios/usuarioPesquisarController.js';
import { usuarioBuscarController } from './controllers/usuarios/usuarioBuscarController.js';
import { usuarioAtualizarController } from './controllers/usuarios/usuarioAtualizarController.js';
import { usuarioDeletarController } from './controllers/usuarios/usuarioDeletarController.js';
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
import { noticiaCapaController } from './controllers/noticiaCapaController.js';
import { validarSchema } from './middlewares/validarSchemaMiddleware.js';
import { usuarioCriarSchema, usuarioAtualizarSchema } from './validators/usuarioValidator.js';

const authRouter = express.Router();
const usuarioRouter = express.Router();
const adminRouter = express.Router();
const comunicacaoRouter = express.Router();
const noticiaRouter = express.Router();

// AUTH - Rotas de autenticação do sistema
authRouter.post("/login", loginController);

// USUÁRIOS - Rotas de gerenciamento de usuários do sistema
usuarioRouter.post("/", validarSchema(usuarioCriarSchema), usuarioCriarController);
usuarioRouter.get("/", autenticarToken, usuarioPesquisarController);
usuarioRouter.get("/:id", autenticarToken, usuarioBuscarController);
usuarioRouter.put("/:id", autenticarToken, validarSchema(usuarioAtualizarSchema), usuarioAtualizarController);
usuarioRouter.delete("/:id", autenticarToken, usuarioDeletarController);

// ADMIN - Rotas de administração do sistema
adminRouter.get("/metricas", adminMetricasController);
adminRouter.delete("/manutencao/limpar-database", manutencaoLimparDatabaseController);
adminRouter.post("/automacao/importar-noticias", automacaoImportarNoticiaController);

// COMUNICAÇÃO - Rotas de comunicação (Newsletter e Contato do Leitor)
comunicacaoRouter.post("/newsletter", newsletterCriarController);
comunicacaoRouter.post("/contato-leitor", contatoLeitorCriarController);

// NOTICIAS - Rotas de Notícias
noticiaRouter.get("/capa", noticiaCapaController);
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.get("/", noticiaPesquisarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.put("/:id", noticiaAtualizarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

export { 
    authRouter,
    usuarioRouter,
    adminRouter,
    comunicacaoRouter,
    noticiaRouter
};

