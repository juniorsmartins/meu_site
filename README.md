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
* TEST - vitest (biblioteca para testes unitários - https://vitest.dev/guide/);
* TEST - supertest (biblio pra simular requisições HTTP e validar códigos status, cabeçalhos e respostas JSON);
* TEST - mongodb-memory-server (Utilitário para testes de integração com MongoDB/Mongoose. Baixa e executa um servidor MongoDB na memória RAM da máquina de testes.);



-> Comandos para instalar biblibotecas
npm i express
npm install mongoose 
npm install cors 
npm install nodemailer
npm install rss-parser
npm install jsonwebtoken 
npm install bcryptjs
npm install --save-dev eslint
npm install --save-dev @faker-js/faker
npm i -D nodemon
npm install -D vitest
npm install -D supertest 
npm install -D mongodb-memory-server



-> Comandos para acionar
npm start
npm run start
npm run dev




ESQUEMA DE DIRETÓRIOS DO BACK-END
* config (configurações da aplicação e do banco de dados);
* controllers (camada para receber requisições HTTP);
* services (camada de lógica e regras de negócio);
* repositories (camada de acesso ao banco de dados);
* middlewares (Funções rodadas antes dos controladores - exemplo: verificações de autenticação);
* models (Esquemas do Mongoose);
* helpers (utilitários e parsers);
* mocks (dados mockados para testes em ambiente local);
* tests (requests locais para testes);

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





npm test              # roda tudo uma vez e termina (ideal para CI)
npm run test:watch    # modo watch: reroda ao salvar (ideal para TDD)
npm run test:coverage # gera relatório de cobertura

npx vitest                      # modo watch
npx vitest run                  # roda uma vez
npx vitest run tests/soma.test.js   # roda um arquivo específico
npx vitest run -t "soma dois"   # roda testes cujo nome contém o texto
npx vitest --ui                 # interface web (precisa de @vitest/ui)


