import mongoose from "mongoose";

const connectToMongo = async (uriOverride = null) => {
    
    // 1. Se já estiver conectado, não faz nada
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    // 2. Define a URI prioritariamente pelo argumento (testes) ou pelo ambiente
    const dbKey = uriOverride || process.env.DB_KEY;

    if (!dbKey) {
        throw new Error("A variável DB_KEY não está configurada no ambiente.");
    }

    // 3. Conecta ao MongoDB
    await mongoose.connect(dbKey);
    console.log("Conectado ao MongoDB com sucesso.");
};

export { connectToMongo };

