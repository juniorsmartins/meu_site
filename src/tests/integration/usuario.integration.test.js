import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../index.js'; // Importa a aplicação Express
import { Usuario } from '../../models/usuarioSchema.js';
import jwt from 'jsonwebtoken';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';

// 1. GARANTE O AMBIENTE E A CHAVE SECRETA ANTES DE QUALQUER IMPORTAÇÃO
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_para_testes_unitarios_e_integracao';

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

describe('Testes de Integração - Usuários', () => {

    describe('Criar Usuário', () => {
        
        it('deve criar novo usuário com sucesso', async () => {
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

        it('não pode criar usuário sem informar email 400', async () => {
            const novoUsuario = {
                nome: 'Usuário Teste',
                senha: 'senhaSegura123'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPOS_OBRIGATÓRIOS);
        });

        it('deve retornar status 409 ao tentar cadastrar e-mail duplicado', async () => {
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

    describe('Atualizar Usuário', () => {

        it('leitor deve atualizar nome e email próprios com sucesso', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            // Cria usuário direto no banco de teste
            const usuarioCriado = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'antigo@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioCriado._id, funcao: 'leitor' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const nomeAtualizado = 'Nome Atualizado';
            const emailAtualizado = 'atualizado@gajeiro.com';

            // Act: Realiza a requisição HTTP para atualizar o usuário
            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ nome: nomeAtualizado, email: emailAtualizado });

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(200);
            expect(response.body.nome).toBe(nomeAtualizado);
            expect(response.body.email).toBe(emailAtualizado);
        });

        it('admin deve atualizar nome, email e função de leitor com sucesso', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            // Cria usuário direto no banco de teste
            const usuarioCriado = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'antigo@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenAdmin = jwt.sign(
                { id: '456', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const nomeAtualizado = 'Nome Atualizado';
            const emailAtualizado = 'atualizado@gajeiro.com';
            const funcaoAtualizada = 'editor';

            // Act: Realiza a requisição HTTP para atualizar o usuário
            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: nomeAtualizado, email: emailAtualizado, funcao: funcaoAtualizada });

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(200);
            expect(response.body.nome).toBe(nomeAtualizado);
            expect(response.body.email).toBe(emailAtualizado);
            expect(response.body.funcao).toBe(funcaoAtualizada);
        });

        it('deve retornar status 400 ao fornecer ID de formato inválido', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // Act: Realiza a requisição HTTP para atualizar o usuário com ID inválido
            const response = await request(app)
                .put('/v1/usuarios/id-invalido-123')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: 'Teste' });

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.ID_INVALIDO);
        });

        it('usuário não encontrado 404 por id inexistente', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const idInexistente = new mongoose.Types.ObjectId();

            // Act: Realiza a requisição HTTP para atualizar o usuário que não existe
            const response = await request(app)
                .put(`/v1/usuarios/${idInexistente}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: 'Nome Teste' });

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO);
        });

        it('deve retornar status 403 se usuário leitor tentar alterar o campo nome de outro usuário', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            const tokenLeitor = jwt.sign(
                { id: '456', funcao: 'leitor' }, 
                process.env.JWT_SECRET || 'secret_teste_jwt', 
                { expiresIn: '1h' }
            );

            const usuarioOutro = await Usuario.create({
                nome: 'Comum2',
                email: 'comum2@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            // Act: Realiza a requisição HTTP para tentar alterar o campo funcao
            const response = await request(app)
                .put(`/v1/usuarios/${usuarioOutro._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ nome: 'Comum2 Alterado' }); 

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_OUTRO_PERFIL);
        });

        it('leitor não pode alterar o próprio campo função 403', async () => {
            // Arrange: Prepara os dados e o ambiente para o teste
            const usuarioComum = await Usuario.create({
                nome: 'Comum',
                email: 'comum@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioComum._id, funcao: 'leitor' }, 
                process.env.JWT_SECRET || 'secret_teste_jwt', 
                { expiresIn: '1h' }
            );

            // Act: Realiza a requisição HTTP para tentar alterar o campo funcao
            const response = await request(app)
                .put(`/v1/usuarios/${usuarioComum._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ funcao: 'admin' }); // Tentando escalar privilégios

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO);
        });
    });

    describe('Pesquisar Usuários)', () => {

        it('admin deve pesquisar usuários com sucesso', async () => {
            // Arrange: Gera um token JWT simulando um usuário admin
            const usuarioLeitor = await Usuario.create({
                nome: 'Leitor',
                email: 'leitor@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const usuarioEditor = await Usuario.create({
                nome: 'Editor',
                email: 'editor@gajeiro.com',
                senha: '123',
                funcao: 'editor'
            });

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // Act: Realiza a requisição HTTP para pesquisar usuários
            const response = await request(app)
                .get('/v1/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            // Assert: Verifica se a resposta está de acordo com o esperado
            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(Array.isArray(response.body.usuarios)).toBe(true);
            expect(response.body.usuarios).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ email: usuarioLeitor.email }),
                    expect.objectContaining({ email: usuarioEditor.email })
                ])
            );
        });

        it('deve retornar status 401 se nenhum token de autenticação for fornecido', async () => {
            const response = await request(app).get('/v1/usuarios');

            expect(response.status).toBe(401);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.TOKEN_NAO_FORNECIDO);
        });

        it('endpoint exclusivo para admins e proibido para demais usuários 403', async () => {
            // Gera um token JWT simulando um usuário leitor/comum
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
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ADMIN_OBRIGATÓRIO);
        });
    });

    describe('Deletar Usuário', () => {

        it('admin deve deletar usuário comum com sucesso.', async () => {
            // Arrange (preparação)
            const usuarioEditor = await Usuario.create({
                nome: 'Usuário Editor',
                email: 'editor@gajeiro.com',
                senha: '123',
                funcao: 'editor'
            });

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            // Act (ação)
            const response = await request(app)
                .delete(`/v1/usuarios/${usuarioEditor._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            // Assert (verificação)
            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.idDeletado).toEqual(String(usuarioEditor._id));
            expect(response.body.mensagem).toContain(MENSAGENS_SUCESSO.USUARIO.DELETADO);
        });

        it('admin deve deletar a si próprio com sucesso.', async () => {

            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };

        });

        it('leitor deve deletar a si próprio com sucesso.', async () => {

            const usuarioLeitor = { id: 'leitor-1', funcao: 'leitor' };

        });
    
        it('deve lançar AppError(400) de ID inválido.', async () => {

            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };

        });
        
        it('deve lançar AppError(404) de usuário não encontrado.', async () => {

            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };

        });

        it('deve lançar AppError(403) por não-admin tentar deletar outro usuário.', async () => {

            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };

        });

        it('deve lançar AppError(403) por admin tentar se deletar sem outro admin presente.', async () => {

            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };

        });
    });
});

