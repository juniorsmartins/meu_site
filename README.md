# meu_site


Endereço: https://meu-site-ashy-omega.vercel.app/ 



-> NPM -> Node Package Manager é o gerenciador do Node.js. É usado para instalar bibliotecas externas, gerenciar dependências, criar e rodar scripts e organizar projetos Node.js.

-> node_modules -> é a pasta onde ficam armazenadas todas as bibliotecas e dependências instaladas pelo NPM. É criada após o "npm install", contém todo o código das bibliotecas e pode ter subpastas internas (dependências das dependências). Essa pasta não deve ser enviada para o repositório remoto (avisar no .gitignore).

-> Rotas no Express.js -> rotas são caminhos que definem como o servidor responde a uma requisição feita para um endereço específico (URL). 


-> Bibliotecas
* nodemon (Facilita o desenvolvimento, pois reinicia o servidor automaticamente quando houver alterações);
* faker-js/faker (serve para gerar grandes volumes de dados fictícios);
* eslint 
* mongoose (Biblioteca ODM (Object Data Modeling) para interagir facilmente com o MongoDB);
* cors 
* express (biblioteca mais popular do Node para criar aplicações web e APIs. Cria servidor web);
* nodemailer (biblioteca de envio de emails - https://nodemailer.com/);
* rss-parser (biblioteca de RSS - lê e converte arquivos XML de Feeds em objetos JavaScript manipuláveis);
* SECURITY - jsonwebtoken (Biblioteca para gerar e verificar tokens JWT);
* SECURITY - bcryptjs (Biblioteca para gerar hashes e comparar senhas com segurança);



-> Comandos para instalar biblibotecas
npm i nodemon -D
npm install --save-dev @faker-js/faker
npm i express
npm install mongoose 
npm install cors 
npm install --save-dev eslint
npm install nodemailer
npm install rss-parser
npm install jsonwebtoken 
npm install bcryptjs



-> Comandos para acionar
npm start
npm run start
npm run dev




ESQUEMA DE DIRETÓRIOS DO BACK-END
* config (configurações da aplicação e do banco de dados);
* controllers (recebem requisições HTTP e delegam a lógica para o service);
* services (lógica e regras de negócio).
* middlewares (Funções rodadas antes dos controladores - exemplo: verificações de autenticação);
* models (Esquemas do Mongoose);
* helpers (utilitários e parsers);
* mocks (dados mockados para testes em ambiente local);
* test (requests locais para testes);

ARQUIVOS
* [...all].js (adaptador para rodar a API em ambiente serverless da Vercel);
* server.js (inicia o servidor);
* index.js (Cria o app, aplica Json parser e Cors, conecta no database e monta rotas por módulo);
* router.js (organiza os endpoints em grupos);



SECURITY (login)
- Passo 1: instalação de bibliotecas no backend (jsonwebtoken e bcryptjs);
- Passo 2: criar variáveis de ambiente no arquivo .env (JWT_SECRET e JWT_EXPIRES_IN);
- Passo 3: criar model de usuário com métodos de criptografia;
- Passo 4: criar middleware de proteção (authMiddleware.js);
- Passo 5: criar rota de autenticação;
- Passo 6: criar controller e service para login;
- Passo 7: consumir rota no front-end.










