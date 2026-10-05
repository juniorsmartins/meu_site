import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um e-mail válido.']
    },
    ativo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);

