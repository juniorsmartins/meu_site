import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        senha: { type: String, required: true }
    }, 
    { timestamps: true } /* Habilita timestamps automáticos para createdAt e updatedAt */
);

const User = mongoose.model("User", userSchema);

export { User };
