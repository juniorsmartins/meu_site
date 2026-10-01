import express from 'express';
import { 
    noticiaConsultarPorIdController, 
    noticiaBuscarController, 
    noticiaCriarController
} from './controllers/noticiaController.js';
import { noticiaDeletarPorIdController } from './controllers/noticiaDeleteController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/", noticiaBuscarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

export { noticiaRouter };

