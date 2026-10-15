import { describe, it, expect, vi, beforeEach } from 'vitest'; // Importando funções do Vitest para testes unitários
import { usuarioCriarService } from '../../../services/usuarios/usuarioCriarService.js'; 
import { usuarioAtualizarService } from '../../../services/usuarios/usuarioAtualizarService.js'; 
import { usuarioRepository } from '../../../repositories/usuarios/usuarioRepository.js';
import { AppError } from '../../../errors/AppError.js';

// Mock do repositório de usuários para testes unitários
vi.mock('../../../repositories/usuarios/usuarioRepository.js');

describe('usuarioService - TDD Unit Tests', () => {

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

        it('deve lançar AppError(409) por e-mail já registrado', async () => {
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

    describe('Atualizar Usuário', () => {

        it ('deve atualizar um usuário com sucesso', async () => {
            // Arrange (preparação dos dados e mocks para o teste)
            const idUsuario = '6acf72ce74ffd75a24c55b43';
            const dadosAtualizacao = { 
                nome: 'Junior Atual', 
                email: 'junior.atual@gajeiro.com' 
            };

            // Usuário já existente no banco (retornado pelo repositório)
            const usuarioExistenteMock = {
                _id: idUsuario,
                nome: 'Junior Antigo',
                email: 'junior@gajeiro.com',
                funcao: 'leitor'
            };

            // Usuário autenticado sem privilégio de admin (ok, porque não está alterando "funcao")
            const usuarioAutenticado = { id: 'u-logado', funcao: 'leitor' };

            // Mock das dependências usadas pelo service
            usuarioRepository.buscarPorId.mockResolvedValue(usuarioExistenteMock);
            usuarioRepository.atualizar.mockResolvedValue({
                ...usuarioExistenteMock,
                ...dadosAtualizacao
            });

            // Act (execução)
            const resultado = await usuarioAtualizarService(
                idUsuario,
                dadosAtualizacao,
                usuarioAutenticado
            );

            // Assert (verificações)
            // 1) Garantimos que buscou o usuário antes de atualizar
            expect(usuarioRepository.buscarPorId).toHaveBeenCalledWith(idUsuario);

            // 2) Garantimos que chamou atualização com o id e objeto mesclado
            //    (o service faz Object.assign no usuário existente)
            expect(usuarioRepository.atualizar).toHaveBeenCalledWith(
                idUsuario,
                expect.objectContaining({
                    _id: idUsuario,
                    nome: 'Junior Atual',
                    email: 'junior.atual@gajeiro.com',
                    funcao: 'leitor'
                })
            );

            // 3) Retorno final esperado
            expect(resultado).toEqual(
                expect.objectContaining({
                    _id: idUsuario,
                    nome: 'Junior Atual',
                    email: 'junior.atual@gajeiro.com'
                })
            );
        });

        it ('deve lançar erro se usuário não existir', async () => {
            // Arrange
            const idUsuario = '6acf72ce74ffd75a24c55b43';
            const dadosAtualizacao = { nome: 'Nome Qualquer' };
            const usuarioAutenticado = { id: 'u-logado', funcao: 'leitor' };

            usuarioRepository.buscarPorId.mockResolvedValue(null);

            // Act & Assert (execução e verificações)
            await expect(usuarioAtualizarService(
                idUsuario,
                dadosAtualizacao,
                usuarioAutenticado
            )).rejects.toHaveProperty('statusCode', 404);
        });



    });
});

