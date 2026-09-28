import app from '../src/index.js';

export default async function handler(request, response) {
    // Garante que a URL seja limpa mantendo a rota do Express
    request.url = request.url.replace(/^\/api/, '') || '/';
    return app(request, response);
}

