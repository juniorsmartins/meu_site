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
        
        it('deve criar novo usuário com sucesso.', async () => {
            const novoUsuario = {
                nome: 'Usuário Teste',
                email: 'teste.integracao@gajeiro.com',
                senha: 'senhaSegura123'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(201);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.CRIADO);
            expect(response.body).toHaveProperty('usuario._id');
            expect(response.body.usuario.nome).toBe(novoUsuario.nome);
            expect(response.body.usuario.email).toBe(novoUsuario.email);
            expect(response.body.usuario.funcao).toBe('leitor'); // Valor padrão para novos usuários
            // Garante que a senha nunca é exposta no JSON de resposta (Clean Code & Segurança)
            expect(response.body.usuario).not.toHaveProperty('senha');
        });

        it('deve lançar erro 400 por nome com limite mínimo de caracteres não atendido.', async () => {
            const novoUsuario = {
                nome: 'U',
                email: 'usuario@gmail.com',
                senha: 'senhaSegura123'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            // Adicionados os parênteses () para invocar a função da mensagem dinâmica
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPO_NOME_MINIMO_CARACTERES());
        });

        it('deve lançar erro 400 por senha com limite mínimo de caracteres não atendido.', async () => {
            const novoUsuario = {
                nome: 'Usuário Teste',
                email: 'usuario@gmail.com',
                senha: '1'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            // Adicionados os parênteses () para invocar a função da mensagem dinâmica
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPO_SENHA_MINIMO_CARACTERES());
        });

        it('deve lançar erro 400 por email não informado.', async () => {
            const novoUsuario = {
                nome: 'Usuário Teste',
                senha: 'senhaSegura123'
            };

            const response = await request(app)
                .post('/v1/usuarios')
                .send(novoUsuario);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPO_EMAIL_OBRIGATORIO);
        });

        it('deve lançar erro 409 por e-mail duplicado.', async () => {
            const dadosDuplicados = {
                nome: 'Duplicado',
                email: 'duplicado@gajeiro.com',
                senha: '123'
            };

            await Usuario.create(dadosDuplicados);

            const response = await request(app)
                .post('/v1/usuarios')
                .send(dadosDuplicados);

            expect(response.status).toBe(409);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO);
        });
    });

    describe('Atualizar Usuário', () => {

        it('admin deve atualizar nome, email, senha e função de leitor com sucesso.', async () => {
            const senhaAntiga = '123';
            const usuarioCriado = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'antigo@gajeiro.com',
                senha: senhaAntiga,
                funcao: 'leitor'
            });

            const tokenAdmin = jwt.sign(
                { id: '456', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const nomeAtualizado = 'Nome Atualizado';
            const emailAtualizado = 'atualizado@gajeiro.com';
            const senhaAtualizada = '898';
            const funcaoAtualizada = 'editor';

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: nomeAtualizado, email: emailAtualizado, senha: senhaAtualizada, funcao: funcaoAtualizada });

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.ATUALIZADO);
            expect(response.body.usuario.nome).toBe(nomeAtualizado);
            expect(response.body.usuario.email).toBe(emailAtualizado);
            expect(response.body.usuario.funcao).toBe(funcaoAtualizada);
            expect(response.body.usuario).not.toHaveProperty('senha');

            // Assert no Banco de Dados: Busca o usuário incluindo o campo senha (select: false)
            const usuarioDoBanco = await Usuario.findById(usuarioCriado._id).select('+senha');
            expect(usuarioDoBanco).not.toBeNull();
            
            // Valida se a senha nova foi devidamente criptografada comparando com a senha em texto limpo
            const senhaBateComHash = await usuarioDoBanco.compararSenha(senhaAtualizada);
            expect(senhaBateComHash).toBe(true);

            // Garante que a senha antiga NÃO funciona mais
            const senhaAntigaBate = await usuarioDoBanco.compararSenha(senhaAntiga);
            expect(senhaAntigaBate).toBe(false);
        });

        it('leitor deve atualizar nome, email e senha próprios com sucesso.', async () => {
            const senhaAntiga = '123';
            const usuarioCriado = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'antigo@gajeiro.com',
                senha: senhaAntiga,
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioCriado._id, funcao: usuarioCriado.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const nomeAtualizado = 'Nome Atualizado';
            const emailAtualizado = 'atualizado@gajeiro.com';
            const senhaAtualizada = '456';

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ nome: nomeAtualizado, email: emailAtualizado, senha: senhaAtualizada });

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.ATUALIZADO);
            expect(response.body.usuario.nome).toBe(nomeAtualizado);
            expect(response.body.usuario.email).toBe(emailAtualizado);
            // Garante que a senha atualizada nunca vaza na resposta HTTP
            expect(response.body.usuario).not.toHaveProperty('senha');

            // Assert no Banco de Dados: Busca o usuário incluindo o campo senha (select: false)
            const usuarioDoBanco = await Usuario.findById(usuarioCriado._id).select('+senha');
            expect(usuarioDoBanco).not.toBeNull();
            
            // Valida se a senha nova foi devidamente criptografada comparando com a senha em texto limpo
            const senhaBateComHash = await usuarioDoBanco.compararSenha(senhaAtualizada);
            expect(senhaBateComHash).toBe(true);

            // Garante que a senha antiga NÃO funciona mais
            const senhaAntigaBate = await usuarioDoBanco.compararSenha(senhaAntiga);
            expect(senhaAntigaBate).toBe(false);
        });

        it('deve lançar erro 400 por ID inválido.', async () => {
            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .put('/v1/usuarios/id-invalido-123')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: 'Teste' });

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });

        it('deve lançar erro 400 por nome com limite mínimo de caracteres não atendido.', async () => {
            const usuarioCriado = await Usuario.create({
                nome: 'Comum',
                email: 'comum@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const nomeInvalido = 'T';

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: nomeInvalido });

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPO_NOME_MINIMO_CARACTERES());
        });

        it('deve lançar erro 400 por senha com limite mínimo de caracteres não atendido.', async () => {
            const usuarioCriado = await Usuario.create({
                nome: 'Comum',
                email: 'comum@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const senhaInvalida = '1';

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioCriado._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ senha: senhaInvalida });

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.CAMPO_SENHA_MINIMO_CARACTERES());
        });

        it('deve lançar erro 403 se leitor tentar alterar outro usuário.', async () => {
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

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioOutro._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ nome: 'Comum2 Alterado' }); 

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_OUTRO_PERFIL);
        });

        it('deve lançar erro 403 se leitor tentar alterar função.', async () => {
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

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioComum._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ funcao: 'admin' }); // Tentando escalar privilégios

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_ATUALIZAR_CAMPO_FUNCAO);
        });

        it('deve lançar erro 404 por usuário não encontrado.', async () => {
            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const idInexistente = new mongoose.Types.ObjectId();

            const response = await request(app)
                .put(`/v1/usuarios/${idInexistente}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({ nome: 'Nome Teste' });

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO);
        });

        it('deve lançar erro 409 por duplicidade de e-mail.', async () => {
            await Usuario.create({
                nome: 'Nome Antigo',
                email: 'duplicado@gajeiro.com',
                senha: '456',
                funcao: 'leitor'
            });

            const usuarioPraAtualizar = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'antigo@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const nomeAtualizado = 'Nome Atualizado';
            const emailAtualizadoDuplicado = 'duplicado@gajeiro.com';

            const tokenLeitor = jwt.sign(
                { id: usuarioPraAtualizar._id, funcao: usuarioPraAtualizar.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .put(`/v1/usuarios/${usuarioPraAtualizar._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`)
                .send({ nome: nomeAtualizado, email: emailAtualizadoDuplicado });

            expect(response.status).toBe(409);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.EMAIL_DUPLICADO);
        });

        it ('deve lançar erro 409 por admin mudar própria função sem haver outro admin.', async () => {
            const adminUnico = await Usuario.create({
                nome: 'Nome Antigo',
                email: 'admin@gajeiro.com',
                senha: '456',
                funcao: 'admin'
            });

            const tokenAdminUnico = jwt.sign(
                { id: adminUnico._id, funcao: adminUnico.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .put(`/v1/usuarios/${adminUnico._id}`)
                .set('Authorization', `Bearer ${tokenAdminUnico}`)
                .send({ funcao: 'editor' });

            expect(response.status).toBe(409);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.USUARIO.ULTIMO_ADMIN);
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
            await Usuario.create({
                nome: 'Usuário Admin1',
                email: 'admin1@gajeiro.com',
                senha: '123',
                funcao: 'admin'
            });

            const usuarioAdminPraDeletar = await Usuario.create({
                nome: 'Usuário Admin2',
                email: 'admin2@gajeiro.com',
                senha: '456',
                funcao: 'admin'
            });

            const tokenAdmin = jwt.sign(
                { id: usuarioAdminPraDeletar._id, funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${usuarioAdminPraDeletar._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.idDeletado).toEqual(String(usuarioAdminPraDeletar._id));
            expect(response.body.mensagem).toContain(MENSAGENS_SUCESSO.USUARIO.DELETADO);
        });

        it('leitor deve deletar a si próprio com sucesso.', async () => {
            const usuarioLeitor = await Usuario.create({
                nome: 'Usuário Leitor',
                email: 'leitor@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioLeitor._id, funcao: usuarioLeitor.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${usuarioLeitor._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.idDeletado).toEqual(String(usuarioLeitor._id));
            expect(response.body.mensagem).toContain(MENSAGENS_SUCESSO.USUARIO.DELETADO);

        });
    
        it('deve lançar erro 400 por ID inválido.', async () => {
            const idInvalido = 'id-invalido';

            const tokenLeitor = jwt.sign(
                { id: '123', funcao: 'leitor' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${idInvalido}`)
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });
        
        it('deve lançar erro 404 por usuário não encontrado.', async () => {
            const idValidoInexistente = new mongoose.Types.ObjectId();

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${idValidoInexistente}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO);
        });

        it('deve lançar erro 403 por não-admin tentar deletar outro.', async () => {
            const usuarioLeitor = await Usuario.create({
                nome: 'Usuário Leitor1',
                email: 'leitor1@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const usuarioLeitorPraDeletar = await Usuario.create({
                nome: 'Usuário Leitor2',
                email: 'leitor2@gajeiro.com',
                senha: '456',
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioLeitor._id, funcao: usuarioLeitor.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${usuarioLeitorPraDeletar._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_OUTRO_PERFIL);
        });

        it('deve lançar erro 403 por admin único tentar se deletar.', async () => {
            const usuarioAdmin = await Usuario.create({
                nome: 'Usuário Admin1',
                email: 'admin1@gajeiro.com',
                senha: '123',
                funcao: 'admin'
            });

            const tokenAdmin = jwt.sign(
                { id: usuarioAdmin._id, funcao: usuarioAdmin.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .delete(`/v1/usuarios/${usuarioAdmin._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_DELETAR_ADMIN_UNICO);
        });
    });

    describe('Buscar usuário', () => {

        it ('admin deve buscar usuário comum com sucesso.', async () => {
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

            const response = await request(app)
                .get(`/v1/usuarios/${usuarioEditor._id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.BUSCADO);
            expect(response.body.usuarioBuscado._id).toBe(usuarioEditor._id.toString());
            expect(response.body.usuarioBuscado.nome).toBe(usuarioEditor.nome);
            expect(response.body.usuarioBuscado.email).toBe(usuarioEditor.email);
            expect(response.body.usuarioBuscado.funcao).toBe(usuarioEditor.funcao);
        });

        it ('leitor deve buscar a si próprio com sucesso.', async () => {
            const usuarioLeitor = await Usuario.create({
                nome: 'Usuário Leitor',
                email: 'leitor@gajeiro.com',
                senha: '123',
                funcao: 'leitor'
            });

            const tokenLeitor = jwt.sign(
                { id: usuarioLeitor._id, funcao: usuarioLeitor.funcao }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .get(`/v1/usuarios/${usuarioLeitor._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.BUSCADO);
            expect(response.body.usuarioBuscado._id).toBe(usuarioLeitor._id.toString());
            expect(response.body.usuarioBuscado.nome).toBe(usuarioLeitor.nome);
            expect(response.body.usuarioBuscado.email).toBe(usuarioLeitor.email);
            expect(response.body.usuarioBuscado.funcao).toBe(usuarioLeitor.funcao);
        });

        it ('deve lançar erro 400 por ID inválido.', async () => {
            const idInvalido = 'id-invalido';

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .get(`/v1/usuarios/${idInvalido}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });

        it ('deve lançar erro 403 por não-admin tentar buscar outro usuário.', async () => {
            const usuarioEditor = await Usuario.create({
                nome: 'Usuário Editor',
                email: 'editor@gajeiro.com',
                senha: '123',
                funcao: 'editor'
            });

            const tokenLeitor = jwt.sign(
                { id: '123', funcao: 'leitor' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .get(`/v1/usuarios/${usuarioEditor._id}`)
                .set('Authorization', `Bearer ${tokenLeitor}`);

            expect(response.status).toBe(403);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.ACESSO_BLOQUEADO_OUTRO_PERFIL);
        });

        it ('deve lançar erro 404 por usuário não encontrado.', async () => {
            const idValidoInexistente = new mongoose.Types.ObjectId();

            const tokenAdmin = jwt.sign(
                { id: '123', funcao: 'admin' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            const response = await request(app)
                .get(`/v1/usuarios/${idValidoInexistente}`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.USUARIO.NAO_ENCONTRADO);
        });
    });

    describe('Pesquisar Usuários)', () => {

        it('admin deve pesquisar usuários com sucesso.', async () => {
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

            const response = await request(app)
                .get('/v1/usuarios')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.USUARIO.PESQUISADO);
            expect(Array.isArray(response.body.usuarios)).toBe(true);
            expect(response.body.usuarios).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ email: usuarioLeitor.email }),
                    expect.objectContaining({ email: usuarioEditor.email })
                ])
            );
        });

        it('deve lançar erro 401 por ausência de token de autenticação.', async () => {
            const response = await request(app).get('/v1/usuarios');

            expect(response.status).toBe(401);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.AUTENTICAÇÃO.TOKEN_NAO_FORNECIDO);
        });

        it('deve lançar erro 403 por não-admin tentar acesso não autorizado.', async () => {
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
});

