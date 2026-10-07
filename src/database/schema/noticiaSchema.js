import mongoose from "mongoose";
import { EDITORIAS } from '../../constants/editorias.js';

const noticiaSchema = new mongoose.Schema(
    {
        chapeu: { type: String, required: true },
        titulo: { type: String, required: true },
        linhaFina: { type: String, required: true },
        conteudo: { type: String, required: true },
        autor: { type: String, required: true },
        imagemUrl: { type: String, required: true },
        imagemLegenda: { type: String, default: "" },
        linkOriginal: { type: String, default: "" },
        editoria: { 
            type: String, 
            required: true, 
            enum: {
                values: EDITORIAS,
                message: '{VALUE} não é uma editoria válida.'
            }
        }
    },
    { timestamps: true } /* Habilita timestamps automáticos para createdAt e updatedAt */
);

// Índice para otimizar consultas por editoria e data de criação
noticiaSchema.index({ editoria: 1, createdAt: -1 });

// Cria o modelo de notícia a partir do schema
const Noticia = mongoose.model("Noticia", noticiaSchema);

export { Noticia };

