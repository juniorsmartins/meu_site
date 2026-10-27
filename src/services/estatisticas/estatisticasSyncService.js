import { regraAutorizarApenasAdmin } from '../../helpers/usuarioUtils.js';
import { AppError } from '../../errors/AppError.js';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../configs/mensagensConfig.js';
import { sincronizarPib } from './adapters/pibAdapter.js';
import { sincronizarDesemprego } from './adapters/desempregoAdapter.js';
import { sincronizarSelic } from './adapters/selicAdapter.js';
import { sincronizarIpca } from './adapters/ipcaAdapter.js';

function formatarDataBCB(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); 
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const estatisticasSyncService = async (usuarioAutenticado) => {
    regraAutorizarApenasAdmin(usuarioAutenticado);

    try {
        console.log("[SYNC ESTATÍSTICAS] Iniciando sincronização via Arquitetura de Adapters (Modular)...");

        const dataHoje = new Date();
        const dataFimStr = formatarDataBCB(dataHoje);
                
        const dataInicio = new Date();
        dataInicio.setFullYear(dataHoje.getFullYear() - 10);
        const dataInicioStr = formatarDataBCB(dataInicio);
        const agora = new Date();

        // Agrupa todas as chamadas dos adaptadores de forma limpa e escalável
        const tarefasSincronizacao = [
            // sincronizarSelic(),
            // sincronizarIpca(),
            // sincronizarPib(),
            sincronizarDesemprego()

            // Futuros adaptadores (ex: sincronizarCambio(agora), sincronizarDivida(agora), etc.) entram aqui automaticamente!
        ];

        // Executa todas as tarefas em paralelo com segurança total (Promise.allSettled)
        const resultados = await Promise.allSettled(tarefasSincronizacao);

        // Opcional: logar quais obtiveram sucesso ou falha individualmente
        resultados.forEach((res, index) => {
            if (res.status === 'rejected') {
                console.error(`[SYNC ESTATÍSTICAS] Tarefa ${index} sofreu uma rejeição inesperada: `, res.reason);
            } else if (res.value?.sucesso === false) {
                console.error(`[SYNC ESTATÍSTICAS] Tarefa ${index} falhou internamente. Slug: ${res.value?.slug || 'desconhecido'}`);
            }
        });

        console.log("[SYNC ESTATÍSTICAS] Sincronização concluída.");

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

