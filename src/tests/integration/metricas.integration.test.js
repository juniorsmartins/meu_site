import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../index.js'; // Importa a aplicação Express
import jwt from 'jsonwebtoken';
import { noticiaRepository } from '../../repositories/noticias/noticiaRepository.js';
import { LIMITE_MAXIMO_NOTICIAS_DATABASE } from '../../configs/constantsConfig.js';

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

describe('Testes de Integração - Métricas', () => {

    it('Deve retornar as métricas do sistema com sucesso.', async () => {
        const novaNoticia = {
                chapeu: 'Chapéu de Teste',
                titulo: 'Título de Teste',
                linhaFina: 'Linha Fina de Teste',
                conteudo: 'Conteúdo de Teste',
                autor: 'Autor de Teste',
                imagemUrl: 'http://imagem.de.teste.com',
                editoria: 'economia'
            };

        await noticiaRepository.criar(novaNoticia);

        const response = await request(app)
            .get('/v1/admin/metricas');

        expect(response.status).toBe(200);
        expect(response.body.bancoDados.totalNoticias).toBe(1);
        expect(response.body.bancoDados.limiteCota).toBe(LIMITE_MAXIMO_NOTICIAS_DATABASE);
        expect(response.body.bancoDados).toHaveProperty('excedente');
        expect(response.body.rss).toHaveProperty('totalFeeds');
        expect(response.body.rss).toHaveProperty('totalPortais');
        expect(response.body.rss).toHaveProperty('portais');
        expect(response.body.sistema).toHaveProperty('status');
    });
});