import app from '../src/index.js';

export default (req, res) => {
    // Remove o prefixo /api da URL preservando a barra inicial
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace(/^\/api/, '') || '/';
    }
    return app(req, res);
};

