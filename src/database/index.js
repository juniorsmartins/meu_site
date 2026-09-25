import mongoose from "mongoose";

const dbKey = process.env.DB_KEY;

const connectToMongo = async () => {

    mongoose.connect(dbKey);

    mongoose.connection.on("connected", () => {
        console.log("Conectado ao MongoDB com sucesso.");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Desconectado do MongoDB.");
    });
}

export { connectToMongo };


