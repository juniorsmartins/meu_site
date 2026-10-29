import { IndicadorModel } from '../../models/indicadorSchema.js';

const indicadorRepository = {
    
    // Substitui o findOneAndUpdate dos adapters
    upsert: async (slug, dados) => {
        return await IndicadorModel.findOneAndUpdate(
            { slug },
            { ...dados, ultimaAtualizacao: new Date() },
            { upsert: true, returnDocument: 'after' }
        );
    },

    // Substitui o find({}) do estatisticasService
    findAll: async () => {
        return await IndicadorModel.find({});
    },

    // Substitui o find({}).sort() do estatisticasController
    findAllSorted: async () => {
        return await IndicadorModel.find({}).sort({ updatedAt: -1 });
    },

    // Opcional: para buscar um indicador específico
    findBySlug: async (slug) => {
        return await IndicadorModel.findOne({ slug });
    }
};

export { 
    indicadorRepository 
};

