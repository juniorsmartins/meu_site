import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../index.js'; // Importa a aplicação Express
import { Usuario } from '../../models/usuarioSchema.js';
import jwt from 'jsonwebtoken';
import { MENSAGENS_ERRO } from '../../configs/mensagensErro.js';

// Define o ambiente como test
process.env.NODE_ENV = 'test';

let mongoServer; // Instância do servidor MongoDB em memória para testes

beforeAll(async () => {
    // Fecha conexões prévias se houverem
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Sobe o banco em memória
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Conecta explicitamente o Mongoose à instância de testes da RAM
    await mongoose.connect(uri);
});

beforeEach(async () => {
    await Usuario.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Usuários - Testes de integração', () => {

    describe('Criar Usuário', () => {
        
        it('deve criar um novo usuário com sucesso e retornar status 201', async () => {
            const novoUsuario = {
                nome: 'Usuário Teste',
                email: 'teste.integracao@gajeiro.com',
                senha: 'senhaSegura123'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.nome).toBe(novoUsuario.nome);
            expect(response.body.email).toBe(novoUsuario.email);
            expect(response.body.funcao).toBe('leitor'); // Valor padrão para novos usuários
            // Garante que a senha nunca é exposta no JSON de resposta (Clean Code & Segurança)
            expect(response.body).not.toHaveProperty('senha');
        });

        it('deve retornar status 409 ao tentar cadastrar um e-mail duplicado', async () => {
            const dadosDuplicados = {
                nome: 'Duplicado',
                email: 'duplicado@gajeiro.com',
                senha: '123'
            };

            // Insere o primeiro usuário diretamente no banco de teste
            await Usuario.create(dadosDuplicados);

            // Tenta cadastrar novamente via requisição HTTP
            const response = await request(app)
                .post('/v1/usuarios')
                .send(dadosDuplicados);

            expect(response.status).toBe(409);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO);
        });
    });

    describe('Pesquisar Usuários - Rota Restrita)', () => {

        it('deve retornar status 401 se nenhum token de autenticação for fornecido', async () => {
            const response = await request(app).get('/v1/usuarios');

            expect(response.status).toBe(401);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.TOKEN_NAO_FORNECIDO);
        });

        it('deve retornar status 403 se usuário comum (não-admin) tentar acessar a listagem restrita', async () => {
            // Gera um token JWT simulando um usuário leitor/comum
            process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret_teste_jwt';
            const tokenLeitor = jwt.sign(
                { id: '123', funcao: 'leitor' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .get('/v1/usuarios')
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_ADMIN_OBRIGATÓRIO);
        });
    });
});

