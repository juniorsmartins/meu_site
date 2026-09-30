import mongoose from "mongoose";

const dbKey = process.env.DB_KEY;

const connectToMongo = async () => {

    if (!dbKey) {
        throw new Error("A variável DB_KEY não está configurada no ambiente.");
    }

    if (mongoose.connection.readyState >= 1) {
        return; // Já está conectado ao MongoDB, não precisa reconectar
    }

    // Conecta ao MongoDB usando a chave de conexão fornecida na variável de ambiente DB_KEY
    // Aguarda a conexão ser estabelecida antes de prosseguir
    await mongoose.connect(dbKey);

    console.log("Conectado ao MongoDB com sucesso.");
}

export { connectToMongo };


