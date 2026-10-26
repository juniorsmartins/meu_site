import { ContatoLeitor } from "../models/contatoLeitorSchema.js";

const contatoLeitorCriarService = async (contatoLeitor) => {

    const novoContatoLeitor = await ContatoLeitor.create(contatoLeitor);
    return novoContatoLeitor;
};

export {
    contatoLeitorCriarService
};

