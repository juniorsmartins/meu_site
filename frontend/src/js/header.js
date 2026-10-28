import { getDatePorExtenso, getTimeHM } from "./utils.js";
import { SITE_CONFIG } from "./constantsConfig.js";

document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header-container"); 
    if (!headerContainer) return;

    try {
        const caminhoAbsolutoHeader = new URL('../html/header.html', import.meta.url).href;
        const response = await fetch(caminhoAbsolutoHeader);
        if (!response.ok) {
            throw new Error(`Erro ao carregar header.html: ${response.status}`);
        }

        headerContainer.innerHTML = await response.text(); 

        const titulo = document.getElementById("header-apresentacao-nome-titulo"); 
        if (titulo) titulo.textContent = SITE_CONFIG.nome;

        const subtitulo = document.getElementById("header-apresentacao-nome-subtitulo");
        if (subtitulo) subtitulo.textContent = SITE_CONFIG.slogan;

        const tituloModal = document.getElementById("modal-titulo-nome-site");
        if (tituloModal) tituloModal.textContent = `Acesse o ${SITE_CONFIG.nome}`;

        document.title = `${SITE_CONFIG.nome} | Jornalismo Independente`;
        document.getElementById("data-extenso").textContent = getDatePorExtenso();

        atualizarHoraDinamica();
        setInterval(atualizarHoraDinamica, 60000);

        await carregarLocalizacaoEClimaDoCliente();

        destacarPaginaAtiva(); 
        configurarEventosAutenticacao();
        verificarEstadoSessao();

    } catch (error) {
        console.error("Erro ao inicializar o cabeçalho:", error);
    }
});

function atualizarHoraDinamica() {
    const horaEl = document.getElementById("hora-extenso");
    if (horaEl) horaEl.textContent = getTimeHM();
}

async function carregarLocalizacaoEClimaDoCliente() {
    const localizacao = document.getElementById("localizacao-extenso");
    const clima = document.getElementById("clima-extenso");

    let localTexto = SITE_CONFIG.localizacaoPadrao;
    let lat = "-15.601";
    let lon = "-56.0978";

    try {
        const localizacaoDoIp = await fetch("https://ipapi.co/json/");
        if (localizacaoDoIp.ok) {
            const dataIp = await localizacaoDoIp.json();
            if (dataIp.city && dataIp.region) {
                localTexto = `${dataIp.city} - ${dataIp.region}, Brasil`;
                lat = dataIp.latitude;
                lon = dataIp.longitude;
            }
        }
    } catch (e) {
        console.warn("Uso do fallback de localização padrão:", e);
    }

    if (localizacao) {
        localizacao.innerHTML = `<i class="bi bi-compass-fill icone-bussola"></i> ${localTexto}`;
    }

    if (clima) {
        await buscarPrevisaoTempo(lat, lon, clima);
    }
}

async function buscarPrevisaoTempo(lat, lon, elementoHtml) {
    try {
        const urlApi = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(urlApi);
        if (!res.ok) return;

        const dados = await res.json();
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
    const caminhoAtual = window.location.pathname;
    const navLinks = document.querySelectorAll("#header-navbar a.nav-link");
    const dropdownContainerIndicadores = document.querySelector('.nav-dropdown-container');

    // Remove classes ativas prévias
    navLinks.forEach(link => link.classList.remove('active'));
    if (dropdownContainerIndicadores) dropdownContainerIndicadores.classList.remove('active');

    // Verifica se está nas páginas de indicadores/gráficos
    if (caminhoAtual.includes('graficos') || caminhoAtual.includes('estatisticas') || caminhoAtual.includes('economia') || caminhoAtual.includes('demografia') || caminhoAtual.includes('infraestrutura')) {
        if (dropdownContainerIndicadores) {
            dropdownContainerIndicadores.classList.add('active');
        }
        return;
    }

    // Caso contrário, verifica links padrão
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && caminhoAtual.includes(href.replace("..", ""))) {
            link.classList.add("active");
        } else if (caminhoAtual === "/" || caminhoAtual.endsWith("index.html")) {
            if (href && href.includes("index.html")) {
                link.classList.add("active");
            }
        }
    });
}

function configurarEventosAutenticacao() {
    const btnAbrir = document.getElementById("btn-abrir-login");
    const btnFechar = document.getElementById("btn-fechar-modal-login");
    const overlay = document.getElementById("modal-login-overlay"); 
    const formLogin = document.getElementById("form-login-modal");
    const btnMenuUsuario = document.getElementById("btn-menu-usuario");
    const dropdownUsuario = document.getElementById("dropdown-menu-usuario");
    const btnLogout = document.getElementById("btn-executar-logout");

    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            if (overlay) overlay.classList.remove("escondido"); 
        });
    }

    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            if (overlay) overlay.classList.add("escondido"); 
        });
    }

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.add("escondido");
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("input-login-email");
            const senhaInput = document.getElementById("input-login-senha");
            const msgErro = document.getElementById("mensagem-erro-login");
            const btnSubmeter = document.getElementById("btn-submeter-login");

            const email = emailInput ? emailInput.value.trim() : "";
            const senha = senhaInput ? senhaInput.value : "";

            if (msgErro) {
                msgErro.classList.add("escondido");
                msgErro.textContent = "";
            }

            if (!email || !senha) return;

            try {
                if (btnSubmeter) {
                    btnSubmeter.disabled = true;
                    btnSubmeter.textContent = "Autenticando...";
                }

                const resposta = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const dados = await resposta.json();

                if (!resposta.ok || !dados.sucesso) {
                    throw new Error(dados.mensagem || "Credenciais inválidas.");
                }

                const usuarioSessao = {
                    id: dados.usuario.id,
                    nome: dados.usuario.nome,
                    email: dados.usuario.email,
                    funcao: dados.usuario.funcao,
                    token: dados.token
                };

                localStorage.setItem("gajeiro_usuario", JSON.stringify(usuarioSessao));
                formLogin.reset();
                if (overlay) overlay.classList.add("escondido");
                verificarEstadoSessao();

            } catch (error) {
                console.error("Erro na autenticação:", error);
                if (msgErro) {
                    msgErro.textContent = error.message;
                    msgErro.classList.remove("escondido");
                }
                formLogin.reset();
            } finally {
                if (btnSubmeter) {
                    btnSubmeter.disabled = false;
                    btnSubmeter.textContent = "Entrar no Portal";
                }
            }
        });
    }

    if (btnMenuUsuario && dropdownUsuario) {
        btnMenuUsuario.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownUsuario.classList.toggle("escondido");
        });

        document.addEventListener("click", () => {
            dropdownUsuario.classList.add("escondido");
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("gajeiro_usuario");
            verificarEstadoSessao();
            const caminhoHome = window.location.pathname.includes('/paginas-logados/') ? '../index.html' : './index.html';
            window.location.href = caminhoHome;
        });
    }
}

function verificarEstadoSessao() {
    const btnAbrir = document.getElementById("btn-abrir-login");
    const containerLogado = document.getElementById("container-usuario-logado");
    const elNomeUsuario = document.getElementById("nome-usuario-header");
    const containerItensMenu = document.getElementById("itens-menu-funcao");
    const dadosSessao = localStorage.getItem("gajeiro_usuario");

    if (dadosSessao) {
        try {
            const usuario = JSON.parse(dadosSessao);
            if (btnAbrir) btnAbrir.classList.add("escondido");
            if (containerLogado) containerLogado.classList.remove("escondido");
            if (elNomeUsuario) elNomeUsuario.textContent = usuario.nome || "Usuário";
            if (containerItensMenu) {
                containerItensMenu.innerHTML = gerarItensMenuPorFuncao(usuario.funcao);
            }
        } catch (e) {
            console.error("Erro ao ler sessão local:", e);
        }
    } else {
        if (btnAbrir) btnAbrir.classList.remove("escondido");
        if (containerLogado) containerLogado.classList.add("escondido");
    }
}

function gerarItensMenuPorFuncao(funcao = 'leitor') {
    let htmlMenu = `
        <a href="/html/paginas-logados/painel-perfil.html" class="item-dropdown-usuario">
            <i class="bi bi-person-gear"></i> Meu Perfil
        </a>
    `;

    if (funcao === 'admin') {
        htmlMenu += `
            <a href="/html/paginas-logados/painel-usuarios.html" class="item-dropdown-usuario">
                <i class="bi bi-people-fill"></i> Painel de Usuários
            </a>
            <a href="/html/paginas-logados/painel-noticias.html" class="item-dropdown-usuario">
                <i class="bi bi-sliders"></i> Painel de Notícias
            </a>
            <a href="/html/paginas-logados/painel-estatisticas.html" class="item-dropdown-usuario">
                <i class="bi bi-graph-up"></i> Painel de Estatísticas
            </a>
            <a href="/html/paginas-logados/painel-contatos.html" class="item-dropdown-usuario">
                <i class="bi bi-envelope-paper-fill"></i> Painel de Contatos
            </a>
            <a href="/html/paginas-logados/mesa-redacao.html" class="item-dropdown-usuario">
                <i class="bi bi-journal-text"></i> Mesa de Redação
            </a>
        `;
    } else if (funcao === 'editor') {
        htmlMenu += `
            <a href="/html/paginas-logados/painel-noticias.html" class="item-dropdown-usuario">
                <i class="bi bi-sliders"></i> Painel de Notícias
            </a>
            <a href="/html/paginas-logados/mesa-redacao.html" class="item-dropdown-usuario">
                <i class="bi bi-journal-text"></i> Mesa de Redação
            </a>
        `;
    } else if (funcao === 'jornalista') {
        htmlMenu += `
            <a href="/html/paginas-logados/mesa-redacao.html" class="item-dropdown-usuario">
                <i class="bi bi-journal-text"></i> Mesa de Redação
            </a>
        `;
    }

    return htmlMenu;
}

