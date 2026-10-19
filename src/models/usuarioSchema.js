import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { FUNCOES_USUARIO } from "../configs/constantsConfig.js";

const usuarioSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: [true, "O nome é obrigatório"],
            trim: true
        },
        email: { 
            type: String, 
            required: [true, "O email é obrigatório"], 
            lowercase: true,
            unique: true 
        },
        senha: { 
            type: String, 
            required: [true, "A senha é obrigatória"],
            select: false // A senha não será retornada por padrão nas consultas
        },
        funcao: {
            type: String,
            enum: Object.values(FUNCOES_USUARIO), // Define os valores permitidos à função
            default: FUNCOES_USUARIO.LEITOR // Define o valor padrão
        }
    }, 
    { timestamps: true } /* Habilita timestamps automáticos para createdAt e updatedAt */
);

// HOOK PRE-SAVE: Executa automaticamente antes de salvar no banco
usuarioSchema.pre('save', async function () {

    // Se a senha não foi modificada/alterada, pula para o próximo passo
    if (!this.isModified('senha')) return;

    // Gera um salt (custo do algoritmo 10) para reforçar o hash
    const salt = await bcrypt.genSalt(10);

    // Substitui a senha em texto limpo pelo hash seguro
    this.senha = bcrypt.hash(this.senha, salt);
});

// MÉTODO AUXILIAR: Para validar se a senha digitada no login bate com o hash salvo
usuarioSchema.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

usuarioSchema.index({ email: 1, createdAt: -1 });

const Usuario = mongoose.model("Usuario", usuarioSchema);

export { Usuario };

