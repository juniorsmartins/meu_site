import { describe, it, expect, vi, beforeEach } from 'vitest'; // Importando funções do Vitest para testes unitários
import { usuarioCriarService } from '../../../services/usuarios/usuarioCriarService.js'; 
import { usuarioAtualizarService } from '../../../services/usuarios/usuarioAtualizarService.js'; 
import { usuarioPesquisarService } from '../../../services/usuarios/usuarioPesquisarService.js';
import { usuarioRepository } from '../../../repositories/usuarios/usuarioRepository.js';
import { AppError } from '../../../errors/AppError.js';

// Mock do repositório de usuários para testes unitários
vi.mock('../../../repositories/usuarios/usuarioRepository.js');

describe('Usuários - Testes unitários de service', () => {

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

        it ('deve atualizar usuário comum com sucesso', async () => {

            // Arrange (preparação dos dados e mocks para o teste)
            const idUsuario = '6acf72ce74ffd75a24c55b43';

            // Usuário já existente no banco 
            const usuarioExistenteMock = {
                _id: idUsuario,
                nome: 'Junior Antigo',
                email: 'junior@gajeiro.com',
                funcao: 'leitor'
            };

            const dadosAtualizacao = { 
                nome: 'Junior Atual', 
                email: 'junior.atual@gajeiro.com' 
            };

            // Usuário autenticado sem privilégio de admin (ok, porque não está alterando "funcao")
            const usuarioAutenticado = { id: idUsuario, funcao: 'leitor' };

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
            const idUsuarioInexistente = '6acf72ce74ffd75a24c55b43';
            const dadosAtualizacao = { nome: 'Nome Qualquer' };
            const usuarioAutenticado = { id: '6acf7c11b3d3823e83b4802e', funcao: 'admin' };

            usuarioRepository.buscarPorId.mockResolvedValue(null);

            // Act & Assert (execução e verificações)
            await expect(usuarioAtualizarService(
                idUsuarioInexistente,
                dadosAtualizacao,
                usuarioAutenticado
            )).rejects.toHaveProperty('statusCode', 404);
        });

    });

    describe('Pesquisar Service', () => {

        it('deve permitir usuário administrador pesquisar e retornar dados paginados', async () => {
            // Arrange
            const usuarioAdmin = { id: '6acf72ce74ffd75a24c55b43', funcao: 'admin' };
            const queryParams = { pagina: 1, limite: 10, nome: 'Junior' };
            
            const mockFiltroRetorno = [
                [{ _id: '1', nome: 'Junior', email: 'junior@gajeiro.com', funcao: 'leitor' }],
                1
            ];
            
            usuarioRepository.pesquisarComFiltroPaginado.mockResolvedValue(mockFiltroRetorno);

            // Act
            const resultado = await usuarioPesquisarService(queryParams, usuarioAdmin);

            // Assert
            expect(usuarioRepository.pesquisarComFiltroPaginado).toHaveBeenCalledWith(
                expect.objectContaining({
                    filtro: { nome: { $regex: 'Junior', $options: 'i' } },
                    pular: 0,
                    limitePorPagina: 10
                })
            );
            expect(resultado).toEqual({
                usuarios: expect.any(Array),
                totalRegistros: 1,
                paginaAtual: 1,
                totalPaginas: 1,
                limitePorPagina: 10
            });
        });

        it('deve lançar AppError(403) se usuário não-admin tentar acessar a pesquisa', async () => {
            // Arrange
            const usuarioComum = { id: 'user-2', funcao: 'leitor' };

            // Act & Assert
            await expect(usuarioPesquisarService({}, usuarioComum))
                .rejects
                .toThrow(AppError);

            await expect(usuarioPesquisarService({}, usuarioComum))
                .rejects
                .toHaveProperty('statusCode', 403);
            
            // Garante que o repositório nem chegou a ser consultado por falha na barreira de segurança
            expect(usuarioRepository.pesquisarComFiltroPaginado).not.toHaveBeenCalled();
        });

        it('deve aplicar filtro por função com sucesso quando solicitado por administrador', async () => {
            // Arrange
            const usuarioAdmin = { id: 'admin-1', funcao: 'admin' };
            const queryParams = { funcao: 'editor' };
            
            usuarioRepository.pesquisarComFiltroPaginado.mockResolvedValue([[], 0]);

            // Act
            await usuarioPesquisarService(queryParams, usuarioAdmin);

            // Assert
            expect(usuarioRepository.pesquisarComFiltroPaginado).toHaveBeenCalledWith(
                expect.objectContaining({
                    filtro: { funcao: 'editor' }
                })
            );
        });
    });

    describe('Deletar Usuário', () => {

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

