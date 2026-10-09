export function getFormattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
}


export function getDatePorExtenso() {

    const now = new Date();

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long", 
        day: "numeric", 
        month: "long", 
        year: "numeric"
    }).format(now);

    // Deixa apenas a primeira letra da frase em maiúsculo (ex: "sexta-feira..." -> "Sexta-feira...")
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}

export function getTimeHM() {

    const now = new Date();

    return new Intl.DateTimeFormat("pt-BR", {
			hour: "2-digit", 
			minute: "2-digit"
		}).format(now);
}


