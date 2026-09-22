import { getDatePorExtenso, getTimeHM } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
	const headerContainer = document.getElementById("header-container");

	if (!headerContainer) {
		return;
	}

	try {
		const response = await fetch("../html/header.html");

		if (!response.ok) {
			throw new Error(`Erro ao carregar header.html: ${response.status}`);
		}

		headerContainer.innerHTML = await response.text();

		document.getElementById("data-extenso").textContent = getDatePorExtenso();
		document.getElementById("hora-extenso").textContent = getTimeHM();
		document.getElementById("localizacao-extenso").textContent = "Cuiabá, Mato Grosso, Brasil";

	} catch (error) {
		console.error(error);
	}
});



