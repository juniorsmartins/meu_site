import app from '../src/index.js';

export default (req, res) => {
    // Remove o prefixo /api da URL para que o Express entenda a rota /noticias
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace('/api', '');
    }
    return app(req, res);
};

