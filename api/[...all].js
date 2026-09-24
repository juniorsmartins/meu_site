import { app } from '../src/index.js';

export default (request, response) => {
    request.url = request.url.replace(/^\/api/, '') || '/';
    return app(request, response);
};
