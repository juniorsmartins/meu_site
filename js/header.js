document.addEventListener("DOMContentLoaded", async () => {
	const headerContainer = document.getElementById("header-container");

	if (!headerContainer) {
		return;
	}

	try {
		const response = await fetch("header.html");

		if (!response.ok) {
			throw new Error(`Erro ao carregar header.html: ${response.status}`);
		}

		headerContainer.innerHTML = await response.text();

		const agora = new Date();

		const dataExtenso = new Intl.DateTimeFormat("pt-BR", {
			weekday: "long", 
			day: "numeric", 
			month: "long", 
			year: "numeric"
		}).format(agora);

		const horaExtenso = new Intl.DateTimeFormat("pt-BR", {
			hour: "2-digit", 
			minute: "2-digit"
		}).format(agora);

		document.getElementById("data-extenso").textContent = dataExtenso;
		document.getElementById("hora-extenso").textContent = horaExtenso;
		document.getElementById("localizacao-extenso").textContent = "Cuiabá, Mato Grosso, Brasil";

	} catch (error) {
		console.error(error);
	}
});



