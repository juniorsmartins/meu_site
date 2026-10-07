import noticiaLimparDatabaseService from "../services/noticiaLimparDatabaseService.js";

const noticiaLimparDatabaseController = async (request, response) => {
 
    const resultado = await noticiaLimparDatabaseService();
    response.status(200).json(resultado);
}

export {
    noticiaLimparDatabaseController
};

