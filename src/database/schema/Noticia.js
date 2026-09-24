import mongoose from "mongoose";

const noticiaSchema = new mongoose.Schema(
    {
        chapeu: { type: String, required: true },
        titulo: { type: String, required: true },
        linhaFina: { type: String, required: true },
        conteudo: { type: String, required: true },
        autor: { type: String, required: true }
    },
    { timestamps: true } /* Habilita timestamps automáticos para createdAt e updatedAt */
);

const Noticia = mongoose.model("Noticia", noticiaSchema);

export { Noticia };
