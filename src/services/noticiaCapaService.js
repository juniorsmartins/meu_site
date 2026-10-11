import { Noticia } from '../database/schema/noticiaSchema.js';
import { EDITORIAS } from '../constants/editorias.js';

/**
 * SERVIÇO DE MONTAGEM DA CAPA DO PORTAL
 * Monta todos os blocos do layout da Home garantindo zero repetição de notícias.
 */
const noticiaCapaService = async () => {

    // Set acumulador para guardar os IDs de notícias já alocadas na tela
    const idsUsados = new Set();

    // =========================================================================
    // ETAPA 1: DESTAQUE PRINCIPAL (1 Notícia)
    // =========================================================================
    // Tenta buscar a notícia mais recente marcada com 'destaquePrincipal: true'
    let destaquePrincipal = await Noticia.findOne({ destaquePrincipal: true })
        .sort({ createdAt: -1 })
        .lean(); // Converte o documento Mongoose em objeto JavaScript simples

    // FALLBACK AUTOMÁTICO: Se nenhuma foi marcada, pega a notícia mais recente do banco
    if (!destaquePrincipal) {
        destaquePrincipal = await Noticia.findOne({})
            .sort({ createdAt: -1 })
            .lean();
    }

    // Registra o ID no acumulador para não repetir abaixo
    if (destaquePrincipal) {
        idsUsados.add(String(destaquePrincipal._id));
    }

    // =========================================================================
    // ETAPA 2: DESTAQUES SECUNDÁRIOS (7 Notícias)
    // =========================================================================
    // Busca notícias marcadas como destaqueSecundario OU sobras de destaquePrincipal (excluindo a principal escolhida)
    let destaquesSecundarios = await Noticia.find({
        _id: { $nin: Array.from(idsUsados) }, // Exclui notícias já usadas
        $or: [ // Notícias marcadas como destaque secundário ou sobras de destaque principal
            { destaqueSecundario: true },
            { destaquePrincipal: true }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(7)
    .lean();

    // Registra no acumulador de IDs os destaques encontrados
    destaquesSecundarios.forEach(n => idsUsados.add(String(n._id)));

    // FALLBACK AUTOMÁTICO: Se não encontrou 7 notícias marcadas, preenche as vagas restantes com as mais recentes gerais
    if (destaquesSecundarios.length < 7) {
        const quantidadeFaltante = 7 - destaquesSecundarios.length;
        
        const noticiasCompletar = await Noticia.find({
            _id: { $nin: Array.from(idsUsados) }
        })
        .sort({ createdAt: -1 })
        .limit(quantidadeFaltante)
        .lean();

        noticiasCompletar.forEach(n => {
            idsUsados.add(String(n._id));
            destaquesSecundarios.push(n);
        });
    }

    // =========================================================================
    // ETAPA 3: BLOCOS DE EDITORIAS (Ex: Política, Economia, Esportes)
    // =========================================================================
    const blocosEditorias = {};

    for (const editoria of EDITORIAS) {
        // Busca notícias da editoria específica que ainda NÃO foram exibidas nos destaques ou em outras editorias
        const noticiasEditoria = await Noticia.find({
            editoria: editoria,
            _id: { $nin: Array.from(idsUsados) }
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

        // Acumula os IDs das notícias encontradas na editoria
        noticiasEditoria.forEach(n => idsUsados.add(String(n._id)));
        blocosEditorias[editoria] = noticiasEditoria;
    }

    // =========================================================================
    // ETAPA 4: ÚLTIMAS NOTÍCIAS (10 Notícias Totalmente Inéditas)
    // =========================================================================
    // Busca as notícias mais recentes descartando TODOS os IDs que já saíram nos destaques e nas editorias
    const ultimasNoticias = await Noticia.find({
        _id: { $nin: Array.from(idsUsados) }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Retorna a estrutura pronta e limpa
    return {
        destaquePrincipal,
        destaquesSecundarios,
        editorias: blocosEditorias,
        ultimasNoticias
    };
};

export { noticiaCapaService };

