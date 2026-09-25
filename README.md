# meu_site



-> package.json -> arquivo principal de um projeto Node.js. Serve para guardar informações sobre o projeto (nome, versão, autor, etc), definir dependências (bibliotecas), criar e configurar scripts de execução, organizar ambientes de desenvolvimento e produção e permite que outras pessoas instalem e rodem o projeto com facilidade. Ele é criado com o comando "npm init".

Obs: no arquivo package.json, usar "type": "module" e não "type": "commonjs", pois o module permite import/export (jeito mais moderno. Antes usava require para importar).

Exemplo antigo com "comonjs": 
const { createRandomUser } = require('./js/mocks/mocks');

Exemplo moderno com "module":
import { createRandomUser } from './js/mocks/mocks.js';


-> NPM -> Node Package Manager é o gerenciador do Node.js. É usado para instalar bibliotecas externas, gerenciar dependências, criar e rodar scripts e organizar projetos Node.js.


-> node_modules -> é a pasta onde ficam armazenadas todas as bibliotecas e dependências instaladas pelo NPM. É criada após o "npm install", contém todo o código das bibliotecas e pode ter subpastas internas (dependências das dependências). Essa pasta não deve ser enviada para o repositório remoto (avisar no .gitignore).


-> Rotas no Express.js -> rotas são caminhos que definem como o servidor responde a uma requisição feita para um endereço específico (URL). 


-> Bibliotecas
* nodemon (executar script para desenvolvimento);
* faker-js/faker (serve para gerar grandes volumes de dados fictícios);
* express (biblioteca mais popular do Node para criar aplicações web e APIs. Cria servidor web);


-> Comandos para instalar biblibotecas
npm i nodemon -D
npm install --save-dev @faker-js/faker
npm i express
npm install mongoose 
npm install cors 
npm install --save-dev eslint


-> Comandos para acionar
npm run start
npm run dev



app.get("/", (request, response) => {
    response.status(200).send("Olá, mundo!");
});

app.get("/multi", (request, response) => {

    try {
        const quantia = request.query.quantia ?? 2;
        response.status(200).json(createRandomUsers(quantia));
    } catch (error) {
        response.status(400).json({
            error: 'Parametro "quantia" precisa ser um numero inteiro maior que 0',
        });
    }
});

app.get("/multi/:quantia", (request, response) => {

    try {
        const quantia = request.params.quantia ?? 2;
        response.status(200).json(createRandomUsers(quantia));
    } catch (error) {
        response.status(400).json({
            error: 'Parametro "quantia" precisa ser um numero inteiro maior que 0',
        });
    }
});

app.post("/criar", (request, response) => {

    const { password } = request.body;

    if(password.length >= 5) {
        response.status(200).send("Senha válida: " + password);
    } else {
        response.status(400).send("Senha inválida");
    }
});









