import { getDatePorExtenso, getTimeHM } from "./utils.js";
import { SITE_CONFIG } from "./constantsConfig.js"; // Importa variável 

console.log("Arquivo header.js carregado.");

document.addEventListener("DOMContentLoaded", async () => {

    // 1 - Obtém o container principal do header no index.html
    const headerContainer = document.getElementById("header-container"); 
    if (!headerContainer) return;

    try {

        // 2 - Carrega o conteúdo do header.html de forma assíncrona
        const response = await fetch("../html/header.html"); 
        if (!response.ok) {
            throw new Error(`Erro ao carregar header.html: ${response.status}`);
        }

        // 3 - Insere o conteúdo do header.html no container principal
        headerContainer.innerHTML = await response.text(); 

        // 4 - Atualiza o título e o subtítulo do header com base na configuração do site
        const titulo = document.getElementById("header-apresentacao-nome-titulo"); 
        if (titulo) {
            titulo.textContent = SITE_CONFIG.nome; // Atualiza o título do header
        }

        const subtitulo = document.getElementById("header-apresentacao-nome-subtitulo");
        if (subtitulo) {
            subtitulo.textContent = SITE_CONFIG.slogan; // Atualiza o subtítulo do header
        }

        // Injeção dinâmica do nome do site no título do Modal
        const tituloModal = document.getElementById("modal-titulo-nome-site");
        if (tituloModal) {
            tituloModal.textContent = `Acesse o ${SITE_CONFIG.nome}`;
        }

        // 5 - Atualiza a tag <title> do navegador automaticamente
        document.title = `${SITE_CONFIG.nome} | Jornalismo Independente`;

        // 6 - Atualiza a data por extenso no header
        document.getElementById("data-extenso").textContent = getDatePorExtenso(); // Atualiza a data por extenso no header

        // 7 - Preenche Hora Inicial e Ativa o Relógio Dinâmico
        atualizarHoraDinamica();
        setInterval(atualizarHoraDinamica, 60000); // Atualiza a cada 60 segundos

        // 8 - Detecta Cidade/Estado/Clima do Leitor por IP
        await carregarLocalizacaoEClimaDoCliente();

        // 9 - Destaca a página ativa no menu de navegação
        destacarPaginaAtiva(); 

        // 10 - Configura eventos de autenticação do usuário
        configurarEventosAutenticacao();

        // 11 - Verifica o estado da sessão do usuário
        verificarEstadoSessao();

    } catch (error) {
        console.error("Erro ao inicializar o cabeçalho:", error);
    }
});

/**
 * Atualiza o elemento de hora com o fuso horário atual do usuário
 */
function atualizarHoraDinamica() {
    
    const horaEl = document.getElementById("hora-extenso");
    if (horaEl) {
        horaEl.textContent = getTimeHM();
    }
}

/**
 * Detecta a localização exata do usuário via IP e busca o clima local
 */
async function carregarLocalizacaoEClimaDoCliente() {

    const localizacao = document.getElementById("localizacao-extenso"); // Elemento que exibirá a localização do usuário
    const clima = document.getElementById("clima-extenso"); // Elemento que exibirá o clima do usuário

    // Fallback padrão configurado no config.js (Cuiabá)
    let localTexto = SITE_CONFIG.localizacaoPadrao;
    let lat = "-15.601";
    let lon = "-56.0978";

    try {
        // API gratuita de geolocalização por IP (sem necessidade de permissão no navegador)
        const localizacaoDoIp = await fetch("https://ipapi.co/json/");
        if (localizacaoDoIp.ok) {
            const dataIp = await localizacaoDoIp.json(); // Dados de localização obtidos a partir do IP do usuário
            if (dataIp.city && dataIp.region) {
                localTexto = `${dataIp.city} - ${dataIp.region}, Brasil`;
                lat = dataIp.latitude;
                lon = dataIp.longitude;
            }
        }

    } catch (e) {
        console.warn("Uso do fallback de localização padrão:", e);
    }

    // Manutenção do ícone de bússola náutica junto da localização 
    if (localizacao) {
        localizacao.innerHTML = `<i class="bi bi-compass-fill icone-bussola"></i> ${localTexto}`;
    }

    // Busca a temperatura para as coordenadas detectadas
    if (clima) {
        await buscarPrevisaoTempo(lat, lon, clima);
    }
}

/**
 * Consulta a API da Open-Meteo, com latitude e longitude, para obter a previsão do tempo atual do usuário
 */
async function buscarPrevisaoTempo(lat, lon, elementoHtml) {

    try {
        const urlApi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(urlApi); // Faz a requisição à API da Open-Meteo com as coordenadas fornecidas
        if (!res.ok) return;

        const dados = await res.json(); // Converte a resposta da API em JSON
        if (dados && dados.current_weather) {
            const temp = Math.round(dados.current_weather.temperature);
            const codigoClima = dados.current_weather.weathercode;
            const icone = obterIconeClima(codigoClima);

            elementoHtml.innerHTML = `
                <i class="bi ${icone}"></i>
                <span>${temp}°C</span>
            `;
        }

    } catch (err) {
        console.error("Erro ao buscar previsão do tempo:", err);
    }
}

function obterIconeClima(codigo) {
    if (codigo === 0) return "bi-sun-fill";
    if (codigo >= 1 && codigo <= 3) return "bi-cloud-sun-fill";
    if (codigo === 45 || codigo === 48) return "bi-cloud-fog-fill";
    if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return "bi-cloud-rain-heavy-fill";
    if (codigo >= 95) return "bi-cloud-lightning-rain-fill";
    return "bi-thermometer-half";
}

function destacarPaginaAtiva() {
    // Obtém o caminho atual da URL para determinar a página ativa no menu de navegação
    const caminhoAtual = window.location.pathname;
    const navLinks = document.querySelectorAll("#header-navbar a.nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && caminhoAtual.includes(href.replace("..", ""))) {
            link.classList.add("active");
        } else if (caminhoAtual === "/" || caminhoAtual.endsWith("index.html")) {
            if (href.includes("index.html")) {
                link.classList.add("active");
            }
        }
    });
}

// Função para gerenciar os cliques do Modal e Logout
function configurarEventosAutenticacao() {

    // Botão que abre o modal de login
    const btnAbrir = document.getElementById("btn-abrir-login");

    // Botão que fecha o modal de login
    const btnFechar = document.getElementById("btn-fechar-modal-login");

    // Elemento de sobreposição do modal de login. Fica atrás do card do modal e captura cliques fora do card.
    const overlay = document.getElementById("modal-login-overlay"); 

    // Formulário de login dentro do modal
    const formLogin = document.getElementById("form-login-modal");

    // Botão que abre o menu do usuário logado
    const btnMenuUsuario = document.getElementById("btn-menu-usuario");

    // Dropdown do menu do usuário logado
    const dropdownUsuario = document.getElementById("dropdown-menu-usuario");

    // Botão de logout dentro do menu do usuário logado
    const btnLogout = document.getElementById("btn-executar-logout");

    // 1. Abrir e Fechar Modal
    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            // Remove a classe "escondido" para exibir o modal
            if (overlay) overlay.classList.remove("escondido"); 
        });
    }

    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            // Adiciona a classe "escondido" para ocultar o modal
            if (overlay) overlay.classList.add("escondido"); 
        });
    }

    // Fechar ao clicar fora do card do modal
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            // Fecha o modal se o clique ocorrer fora do card do modal
            if (e.target === overlay) overlay.classList.add("escondido");
        });
    }

    // 2. Submeter Formulário de Login
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {

            // Previne o comportamento padrão do formulário (recarregar a página)
            e.preventDefault();

            // Obtém os valores dos campos de email e senha do formulário
            const emailDigitado = document.getElementById("input-login-email").value.trim();
            const senhaDigitada = document.getElementById("input-login-senha").value;

            // Simulação de autenticação (pode ser substituído pela chamada de API POST no futuro)
            // Verifica se todos os campos foram preenchidos antes de simular o login
           if (emailDigitado && senhaDigitada) {

                // Extrai o nome de usuário a partir da primeira parte do e-mail (ex: "junior" de "junior@email.com")
                const nomeExtraido = emailDigitado.split(/[@._]/)[0];

                const usuarioSimulado = {
                    nome: nomeExtraido,
                    email: emailDigitado,
                    logado: true
                };

                localStorage.setItem("gajeiro_usuario", JSON.stringify(usuarioSimulado));

                if (overlay) overlay.classList.add("escondido");
                verificarEstadoSessao();
            }
        });
    }

    // 3. Abrir/Fechar Dropdown do Usuário Logado
    if (btnMenuUsuario && dropdownUsuario) {
        // Alterna a visibilidade do dropdown do usuário logado ao clicar no botão do menu do usuário
        btnMenuUsuario.addEventListener("click", (e) => {
            // Impede que o clique no botão feche o dropdown imediatamente
            e.stopPropagation();
            // Alterna a classe "escondido" para mostrar ou ocultar o dropdown do usuário logado
            dropdownUsuario.classList.toggle("escondido");
        });

        document.addEventListener("click", () => {
            // Fecha o dropdown do usuário logado ao clicar em qualquer lugar fora dele
            dropdownUsuario.classList.add("escondido");
        });
    }

    // 4. Executar Logout
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            // Remove o estado de sessão do localStorage para efetuar o logout
            localStorage.removeItem("gajeiro_usuario");
            // Atualiza a interface do usuário após o logout
            verificarEstadoSessao();
        });
    }
}

// Verifica se o usuário já possui sessão no localStorage e alterna os botões do header
function verificarEstadoSessao() {

    // Obtém referência ao botão de abrir o modal de login
    const btnAbrir = document.getElementById("btn-abrir-login");

    // Obtém referência ao container do usuário logado
    const containerLogado = document.getElementById("container-usuario-logado");

    // Obtém referência ao elemento que exibe o nome do usuário no header
    const elNomeUsuario = document.getElementById("nome-usuario-header");

    // Obtém os dados da sessão do localStorage
    const dadosSessao = localStorage.getItem("gajeiro_usuario");

    if (dadosSessao) {
        try {
            const usuario = JSON.parse(dadosSessao);
            if (btnAbrir) btnAbrir.classList.add("escondido");
            if (containerLogado) containerLogado.classList.remove("escondido");
            if (elNomeUsuario) elNomeUsuario.textContent = usuario.nome;
        } catch (e) {
            console.error("Erro ao ler sessão local:", e);
        }
    } else {
        if (btnAbrir) btnAbrir.classList.remove("escondido");
        if (containerLogado) containerLogado.classList.add("escondido");
    }
}

