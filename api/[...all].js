import { app } from '../index.js';

export default (request, response) => {
    request.url = request.url.replace(/^\/api/, '') || '/';
    return app(request, response);
};
