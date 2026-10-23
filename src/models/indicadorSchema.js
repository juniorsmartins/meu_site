import mongoose from 'mongoose';

const indicadorSchema = new mongoose.Schema(
    
    {
        slug: { 
            type: String, 
            required: true, 
            unique: true 
        }, // ex: 'pib', 'desemprego', 'ipca', 'selic'
        titulo: { 
            type: String, 
            required: true 
        }, // ex: 'Crescimento do PIB (%)'
        fonte: { 
            type: String, 
            required: true 
        }, // ex: 'IBGE - Tabela 6784'
        unidade: { 
            type: String, 
            default: '%' 
        }, // ex: '%'
        anos: { 
            type: [String], 
            default: [] 
        }, // ex: ['1996', '1997', ...]
        valores: { 
            type: [Number], 
            default: [] 
        }, // ex: [2.2, 3.4, ...]
        ultimaAtualizacao: { 
            type: Date, 
            default: Date.now 
        }
    }, 
    { timestamps: true }
);

indicadorSchema.index({ slug: 1, createdAt: -1 });

const IndicadorModel = mongoose.model('IndicadorModel', indicadorSchema);

export { IndicadorModel };

