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
});

