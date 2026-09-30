import mongoose from "mongoose";

const noticiaSchema = new mongoose.Schema(
    {
        chapeu: { type: String, required: true },
        titulo: { type: String, required: true },
        linhaFina: { type: String, required: true },
        conteudo: { type: String, required: true },
        autor: { type: String, required: true },
        imagemUrl: { type: String, required: true },
        editoria: {
            type: String, 
            required: true,
            enum: ["política", "esportes", "entretenimento", "tecnologia", "saúde", "economia", "opinião", "editorial", "turismo", "cultura"],
            lowercase: true, 
            trim: true
        }
    },
    { timestamps: true } /* Habilita timestamps automáticos para createdAt e updatedAt */
);

// Índice para otimizar consultas por editoria e data de criação
noticiaSchema.index({ editoria: 1, createdAt: -1 });

const Noticia = mongoose.model("Noticia", noticiaSchema);

export { Noticia };

