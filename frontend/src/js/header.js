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

		const dataExtensa = getDatePorExtenso(); /* Usa função importada da utils.js */
		const horaMinutos = getTimeHM(); /* Formato HH:MM. Usa uma função do utils.js */

		document.getElementById("data-extenso").textContent = dataExtensa;
		document.getElementById("hora-extenso").textContent = horaMinutos;
		document.getElementById("localizacao-extenso").textContent = "Cuiabá, Mato Grosso, Brasil";

	} catch (error) {
		console.error(error);
	}
});



