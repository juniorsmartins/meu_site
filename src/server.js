import { app } from './index.js';

console.log("Arquivo server.js carregado.");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

