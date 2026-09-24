import { app } from '../src/index.js';

/*
    Este arquivo serve como ponto de entrada para a função serverless do Vercel.
    O Vercel expõe funções em /api/*, mas nossas rotas Express foram definidas sem esse prefixo.
*/

export default (request, response) => {
    request.url = request.url.replace(/^\/api/, '') || '/';
    return app(request, response);
};

