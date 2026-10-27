import { regraAutorizarApenasAdmin } from '../../helpers/usuarioUtils.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';
import { sincronizarPib } from './adapters/pibAdapter.js';
import { sincronizarDesemprego } from './adapters/desempregoAdapter.js';
import { sincronizarSelic } from './adapters/selicAdapter.js';
import { sincronizarIpca } from './adapters/ipcaAdapter.js';
import { sincronizarDivida } from './adapters/dividaPublicaAdapter.js';
import { sincronizarCambio } from './adapters/cambioAdapter.js';
import { sincronizarReservas } from './adapters/reservasAdapter.js';

const estatisticasSyncService = async (usuarioAutenticado) => {

    regraAutorizarApenasAdmin(usuarioAutenticado);

    try {
        console.log("[SYNC ESTATÍSTICAS] Iniciando sincronização via Arquitetura de Adapters (Modular)...");

        // Agrupa os adaptadores (sem executá-los ainda)
        const adapters = [
            // { nome: 'Selic', fn: sincronizarSelic },
            // { nome: 'IPCA', fn: sincronizarIpca },
            // { nome: 'PIB', fn: sincronizarPib },
            // { nome: 'Desemprego', fn: sincronizarDesemprego },
            // { nome: 'Dívida', fn: sincronizarDivida },
            { nome: 'Câmbio', fn: sincronizarCambio },
            { nome: 'Reservas', fn: sincronizarReservas }
        ];

        // Executa sequencialmente
        for (const adapter of adapters) {
            try {
                const resultado = await adapter.fn();

                if (!resultado.sucesso) {
                    console.error(`[SYNC ESTATÍSTICAS] Adapter ${adapter.nome} falhou.`);
                } else {
                    console.log(`[SYNC ESTATÍSTICAS] Adapter ${adapter.nome} finalizado.`);
                }

            } catch (error) {
                console.error(`[SYNC ESTATÍSTICAS] Erro inesperado no adapter ${adapter.nome}:`, error.message);
            }
            
            // Pausa de 2 segundos entre um adaptador e outro
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log("[SYNC ESTATÍSTICAS] Sincronização de todos os adaptadores concluída.");

        return { 
            sucesso: true, 
            mensagem: MENSAGENS_SUCESSO.ESTATISTICAS.CARREGADAS_COM_SUCESSO 
        };

    } catch (error) {
        console.error("[SYNC ESTATÍSTICAS] Erro crítico na sincronização:", error);
        throw new AppError(MENSAGENS_ERRO.SERVIDOR.ERRO_INTERNO, 500);
    }
};

export { 
    estatisticasSyncService 
};

