import { describe, it, expect, vi, beforeEach } from 'vitest'; // Importando funções do Vitest para testes unitários
import { usuarioCriarService } from '../../../services/usuarios/usuarioCriarService.js'; 
import { usuarioRepository } from '../../../repositories/usuarios/usuarioRepository.js';
import { AppError } from '../../../errors/AppError.js';

// Mock do repositório de usuários para testes unitários
vi.mock('../../../repositories/usuarios/usuarioRepository.js');

describe('usuarioCriarService - TDD Unit Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Criar Usuário', () => {
        
        it('deve criar um usuário com sucesso', async () => {
            const dadosUsuario = { nome: 'Junior', email: 'junior@gajeiro.com', senha: '123' };
            const usuarioCriadoMock = { id: '123', ...dadosUsuario, funcao: 'leitor' };

            usuarioRepository.buscarPorEmail.mockResolvedValue(null);
            usuarioRepository.criar.mockResolvedValue(usuarioCriadoMock);

            const resultado = await usuarioCriarService(dadosUsuario);

            expect(usuarioRepository.buscarPorEmail).toHaveBeenCalledWith('junior@gajeiro.com');
            expect(usuarioRepository.criar).toHaveBeenCalledWith(dadosUsuario);
            expect(resultado).toEqual(usuarioCriadoMock);
        });

        it('deve lançar AppError(409) se o e-mail já estiver cadastrado', async () => {
            const dadosUsuario = { nome: 'Junior', email: 'duplicado@gajeiro.com', senha: '123' };

            usuarioRepository.buscarPorEmail.mockResolvedValue({ id: '999', email: 'duplicado@gajeiro.com' });

            await expect(usuarioCriarService(dadosUsuario))
                .rejects
                .toThrow(AppError);

            await expect(usuarioCriarService(dadosUsuario))
                .rejects
                .toHaveProperty('statusCode', 409);
        });
    });
});

