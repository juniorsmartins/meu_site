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
import { sincronizarCredito } from './adapters/creditoAdapter.js';
import { sincronizarInadimplencia } from './adapters/inadimplenciaAdapter.js';
import { sincronizarBalancaComercial } from './adapters/balancaComercialAdapter.js';
import { sincronizarVendasVarejo } from './adapters/vendasVarejoAdapter.js';
import { sincronizarPopulacao } from './adapters/populacaoAdapter.js';
import { sincronizarIdh } from './adapters/idhAdapter.js';
import { sincronizarMortalidadeMaterna } from './adapters/mortalidadeMaternaAdapter.js'; 
import { sincronizarExpectativaVida } from './adapters/expectativaVidaAdapter.js';
import { sincronizarFecundidade } from './adapters/fecundidadeAdapter.js';
import { sincronizarUrbanizacao } from './adapters/urbanizacaoAdapter.js';
import { sincronizarMortalidadeInfantil } from './adapters/mortalidadeInfantilAdapter.js';
import { sincronizarEnvelhecimento } from './adapters/envelhecimentoAdapter.js';

const estatisticasSyncService = async (usuarioAutenticado, fonteFiltro = null) => {

    regraAutorizarApenasAdmin(usuarioAutenticado);

    try {
        console.log(`[SYNC ESTATÍSTICAS] Iniciando sincronização. Filtro: ${fonteFiltro || 'TODOS'}...`);

        // Lista completa de adaptadores
        const todosAdapters = [
            { nome: 'Selic', fn: sincronizarSelic },
            { nome: 'IPCA', fn: sincronizarIpca },
            { nome: 'PIB', fn: sincronizarPib },
            { nome: 'Desemprego', fn: sincronizarDesemprego },
            { nome: 'Dívida', fn: sincronizarDivida }, // O dropdown envia 'Dívida'
            { nome: 'Câmbio', fn: sincronizarCambio },
            { nome: 'Reservas', fn: sincronizarReservas },
            { nome: 'Crédito', fn: sincronizarCredito }, 
            { nome: 'Inadimplência', fn: sincronizarInadimplencia },
            { nome: 'Balança Comercial', fn: sincronizarBalancaComercial },
            { nome: 'Vendas no Varejo', fn: sincronizarVendasVarejo },
            // Demográficos (Unificado)
            { nome: 'População', fn: sincronizarPopulacao }, // Adaptador unificado para indicadores de População Total e Crescimento Populacional
            { nome: 'IDH', fn: sincronizarIdh }, // Adaptador para o Índice de Desenvolvimento Humano (IDH)
            { nome: 'Mortalidade Materna', fn: sincronizarMortalidadeMaterna },
            { nome: 'Expectativa de Vida', fn: sincronizarExpectativaVida },
            { nome: 'Fecundidade', fn: sincronizarFecundidade },
            { nome: 'Urbanização', fn: sincronizarUrbanizacao }, 
            { nome: 'Mortalidade Infantil', fn: sincronizarMortalidadeInfantil },
            { nome: 'Envelhecimento', fn: sincronizarEnvelhecimento }
        ];

        // Filtra os adaptadores com base na escolha do frontend
        const adaptersParaRodar = (fonteFiltro && fonteFiltro !== 'TODOS')
            ? todosAdapters.filter(a => a.nome.toLowerCase() === fonteFiltro.toLowerCase())
            : todosAdapters;

        if (adaptersParaRodar.length === 0) {
            throw new Error(`Fonte "${fonteFiltro}" não encontrada.`);
        }

        // Executa os adaptadores SEQUENCIALMENTE
        for (const adapter of adaptersParaRodar) {
            try {
                const resultado = await adapter.fn();

                if (!resultado.sucesso) {
                    console.error(`[SYNC ESTATÍSTICAS] Adapter ${adapter.nome} falhou.`);
                } else {
                    console.log(`[SYNC ESTATÍSTICAS] Adapter ${adapter.nome} finalizado com SUCESSO.`);
                }

            } catch (error) {
                // Se um adaptador der erro, o catch interno impede que os outros parem
                console.error(`[SYNC ESTATÍSTICAS] Erro inesperado no adapter ${adapter.nome}:`, error.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

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

