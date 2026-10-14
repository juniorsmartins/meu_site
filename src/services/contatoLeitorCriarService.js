import { ContatoLeitor } from "../models/contatoLeitorSchema.js";

console.log("Arquivo contatoLeitorCriarService.js carregado.");

const contatoLeitorCriarService = async (contatoLeitor) => {

    const novoContatoLeitor = await ContatoLeitor.create(contatoLeitor);
    return novoContatoLeitor;
};

export {
    contatoLeitorCriarService
};

