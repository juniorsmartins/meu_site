export function getFormattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
}


export function getDatePorExtenso() {

    const now = new Date();

    return new Intl.DateTimeFormat("pt-BR", {
			weekday: "long", 
			day: "numeric", 
			month: "long", 
			year: "numeric"
		}).format(now);
}

export function getTimeHM() {

    const now = new Date();

    return new Intl.DateTimeFormat("pt-BR", {
			hour: "2-digit", 
			minute: "2-digit"
		}).format(now);
}


