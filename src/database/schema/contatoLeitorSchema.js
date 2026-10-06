import mongoose from "mongoose";

const contatoLeitorSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: [true, "O nome é obrigatório."],
            trim: true
        },
        email: {
            type: String,
            required: [true, "O e-mail é obrigatório."],
            lowercase: true,
            trim: true
        },
        assunto: {
            type: String,
            required: [true, "O assunto é obrigatório."],
            enum: ["sugestao-pauta", "correcao", "publicidade", "duvida", "outro"]
        },
        mensagem: {
            type: String,
            required: [true, "A mensagem é obrigatória."],
            trim: true
        },
        ipRemetente: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pendente", "lido", "respondido"],
            default: "pendente"
        }
    },
    {
        timestamps: true // Cria automaticamente os campos createdAt e updatedAt
    }
);

const ContatoLeitor = mongoose.model("ContatoLeitor", contatoLeitorSchema);

export { ContatoLeitor };

