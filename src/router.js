import express from 'express';
import { 
    noticiaConsultarPorIdController, 
    noticiaBuscarController, 
    noticiaCriarController,
    noticiaDeletarPorIdController
} from './controllers/noticiaController.js';

const noticiaRouter = express.Router();

noticiaRouter.get("/", noticiaBuscarController);
noticiaRouter.get("/:id", noticiaConsultarPorIdController);
noticiaRouter.post("/", noticiaCriarController);
noticiaRouter.delete("/:id", noticiaDeletarPorIdController);

export { noticiaRouter };

