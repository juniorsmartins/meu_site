import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../index.js'; // Importa a aplicação Express
import jwt from 'jsonwebtoken';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';
import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';

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
    await noticiaRepository.deleteAll(); // Limpa todas as notícias antes de cada teste
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Testes de Integração - Notícias', () => {

    describe('Criar Notícia', () => {

        it('Deve criar uma notícia com sucesso.', async () => {
            const novaNoticia = {
                chapeu: 'Chapéu de Teste',
                titulo: 'Título de Teste',
                linhaFina: 'Linha Fina de Teste',
                conteudo: 'Conteúdo de Teste',
                autor: 'Autor de Teste',
                imagemUrl: 'http://imagem.de.teste.com',
                editoria: 'economia'
            };

            const response = await request(app)
                .post('/v1/noticias')
                .send(novaNoticia);

            expect(response.status).toBe(201);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.NOTICIA.CRIADO);
            expect(response.body).toHaveProperty('noticia._id');
            expect(response.body.noticia.chapeu).toBe(novaNoticia.chapeu);
            expect(response.body.noticia.titulo).toBe(novaNoticia.titulo);
            expect(response.body.noticia.linhaFina).toBe(novaNoticia.linhaFina);
            expect(response.body.noticia.conteudo).toBe(novaNoticia.conteudo);
            expect(response.body.noticia.autor).toBe(novaNoticia.autor);
            expect(response.body.noticia.imagemUrl).toBe(novaNoticia.imagemUrl);
            expect(response.body.noticia.editoria).toBe(novaNoticia.editoria);
        });
    });

    describe('Atualizar Notícia', () => {

        it('Deve atualizar uma notícia com sucesso.', async () => {
            const noticiaOriginal = {
                chapeu: 'Chapéu de Teste',
                titulo: 'Título de Teste',
                linhaFina: 'Linha Fina de Teste',
                conteudo: 'Conteúdo de Teste',
                autor: 'Autor de Teste',
                imagemUrl: 'http://imagem.de.teste.com',
                editoria: 'economia'
            };

            const noticiaOriginalNoBanco = await noticiaRepository.criar(noticiaOriginal);

            const noticiaAtualizada = {
                chapeu: 'Chapéu de Teste Atual',
                titulo: 'Título de Teste Atual',
                linhaFina: 'Linha Fina de Teste Atual',
                conteudo: 'Conteúdo de Teste Atual',
                autor: 'Autor de Teste Atual',
                imagemUrl: 'http://imagem.de.teste.com/atual',
                editoria: 'geral'
            };

            const response = await request(app)
                .put(`/v1/noticias/${noticiaOriginalNoBanco._id}`)
                .send(noticiaAtualizada);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.NOTICIA.ATUALIZADO);
            expect(response.body).toHaveProperty('noticia._id');
            expect(response.body.noticia.chapeu).toBe(noticiaAtualizada.chapeu);
            expect(response.body.noticia.titulo).toBe(noticiaAtualizada.titulo);
            expect(response.body.noticia.linhaFina).toBe(noticiaAtualizada.linhaFina);
            expect(response.body.noticia.conteudo).toBe(noticiaAtualizada.conteudo);
            expect(response.body.noticia.autor).toBe(noticiaAtualizada.autor);
            expect(response.body.noticia.imagemUrl).toBe(noticiaAtualizada.imagemUrl);
            expect(response.body.noticia.editoria).toBe(noticiaAtualizada.editoria);

            const noticiaNoBanco = await noticiaRepository.buscarPorId(noticiaOriginalNoBanco._id);
            expect(noticiaNoBanco.chapeu).toBe(noticiaAtualizada.chapeu);
            expect(noticiaNoBanco.titulo).toBe(noticiaAtualizada.titulo);
            expect(noticiaNoBanco.linhaFina).toBe(noticiaAtualizada.linhaFina);
            expect(noticiaNoBanco.conteudo).toBe(noticiaAtualizada.conteudo);
            expect(noticiaNoBanco.autor).toBe(noticiaAtualizada.autor);
            expect(noticiaNoBanco.imagemUrl).toBe(noticiaAtualizada.imagemUrl);
            expect(noticiaNoBanco.editoria).toBe(noticiaAtualizada.editoria);
        });

        it('Deve lançar erro 400 por ID inválido.', async () => {
            const noticiaAtualizada = {
                chapeu: 'Chapéu de Teste Atual',
                titulo: 'Título de Teste Atual',
                linhaFina: 'Linha Fina de Teste Atual',
                conteudo: 'Conteúdo de Teste Atual',
                autor: 'Autor de Teste Atual',
                imagemUrl: 'http://imagem.de.teste.com/atual',
                editoria: 'geral'
            };

            const response = await request(app)
                .put('/v1/noticias/invalid-id')
                .send(noticiaAtualizada);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });

        it('Deve lançar erro 404 por notícia não encontrada.', async () => {
            const noticiaAtualizada = {
                chapeu: 'Chapéu de Teste Atual',
                titulo: 'Título de Teste Atual',
                linhaFina: 'Linha Fina de Teste Atual',
                conteudo: 'Conteúdo de Teste Atual',
                autor: 'Autor de Teste Atual',
                imagemUrl: 'http://imagem.de.teste.com/atual',
                editoria: 'geral'
            };

            const response = await request(app)
                .put('/v1/noticias/609e129e8f1b2c0015b8b8b8') // ID que não existe no banco
                .send(noticiaAtualizada);

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.NOTICIA.NAO_ENCONTRADO);
        });
    });

    describe('Deletar Notícia', () => {

        it('Deve deletar uma notícia com sucesso.', async () => {
            const noticia = {
                chapeu: 'Chapéu de Teste',
                titulo: 'Título de Teste',
                linhaFina: 'Linha Fina de Teste',
                conteudo: 'Conteúdo de Teste',
                autor: 'Autor de Teste',
                imagemUrl: 'http://imagem.de.teste.com',
                editoria: 'economia'
            };

            const noticiaExistente = await noticiaRepository.criar(noticia);

            const response = await request(app)
                .delete(`/v1/noticias/${noticiaExistente._id}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.NOTICIA.DELETADO);
            expect(response.body.idDeletado).toEqual(String(noticiaExistente._id));

            const noticiaDeletada = await noticiaRepository.buscarPorId(noticiaExistente._id);
            expect(noticiaDeletada).toBeNull();
        });

        it('Deve lançar erro 400 por ID inválido.', async () => {
            const idInvalido = 'id-invalido';

            const response = await request(app)
                .delete(`/v1/noticias/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });

        it('Deve lançar erro 404 por notícia não encontrada.', async () => {
            const idValidoInexistente = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/v1/noticias/${idValidoInexistente}`);

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.NOTICIA.NAO_ENCONTRADO);
        });
    });

    describe('Buscar Notícia', () => {

        it('Deve buscar uma notícia com sucesso.', async () => {
            const noticia = {
                chapeu: 'Chapéu de Teste',
                titulo: 'Título de Teste',
                linhaFina: 'Linha Fina de Teste',
                conteudo: 'Conteúdo de Teste',
                autor: 'Autor de Teste',
                imagemUrl: 'http://imagem.de.teste.com',
                editoria: 'economia'
            };

            const noticiaExistente = await noticiaRepository.criar(noticia);

            const response = await request(app)
                .get(`/v1/noticias/${noticiaExistente._id}`);

            expect(response.status).toBe(200);
            expect(response.body.sucesso).toBe(true);
            expect(response.body.mensagem).toBe(MENSAGENS_SUCESSO.NOTICIA.BUSCADO);
            expect(response.body.noticia._id).toBe(noticiaExistente._id.toString());
            expect(response.body.noticia.chapeu).toBe(noticia.chapeu);
            expect(response.body.noticia.titulo).toBe(noticia.titulo);
            expect(response.body.noticia.linhaFina).toBe(noticia.linhaFina);
            expect(response.body.noticia.conteudo).toBe(noticia.conteudo);
            expect(response.body.noticia.autor).toBe(noticia.autor);
            expect(response.body.noticia.imagemUrl).toBe(noticia.imagemUrl);
            expect(response.body.noticia.editoria).toBe(noticia.editoria);
            expect(response.body.noticia).toMatchObject(noticia);
        });

        it('Deve lançar erro 400 por ID inválido.', async () => {
            const idInvalido = 'id-invalido';

            const response = await request(app)
                .get(`/v1/noticias/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toContain(MENSAGENS_ERRO.GERAL.ID_INVALIDO);
        });

        it('Deve lançar erro 404 por notícia não encontrada.', async () => {
            const idValidoInexistente = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/v1/noticias/${idValidoInexistente}`);

            expect(response.status).toBe(404);
            expect(response.body.sucesso).toBe(false);
            expect(response.body.mensagem).toBe(MENSAGENS_ERRO.NOTICIA.NAO_ENCONTRADO);
        });
    });
});

