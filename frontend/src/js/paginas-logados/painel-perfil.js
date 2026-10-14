import { API_URL_USUARIOS } from '../constantsConfig.js';

console.log("Arquivo painel-perfil.js carregado.");

document.addEventListener("DOMContentLoaded", () => {

    // 1. Trava de segurança no Frontend: exige que o usuário esteja logado
    const dadosSessao = localStorage.getItem("gajeiro_usuario");

    if (!dadosSessao) {
        alert("Acesso restrito. Por favor, faça login para acessar seu perfil.");
        window.location.href = "../../html/index.html";
        return;
    }

    const usuarioSessao = JSON.parse(dadosSessao);

    // 2. Preenche os campos do formulário com os dados atuais da sessão
    preencherDadosFormulario(usuarioSessao);

    // 3. Configura o ouvinte de envio do formulário
    configurarFormularioPerfil(usuarioSessao);
});

function preencherDadosFormulario(usuario) {
    const elNomeHeader = document.getElementById("label-nome-usuario");
    const elBadgeFuncao = document.getElementById("badge-funcao-usuario");
    
    const inputNome = document.getElementById("perfil-nome");
    const inputEmail = document.getElementById("perfil-email");
    const selectFuncao = document.getElementById("perfil-funcao");

    if (elNomeHeader) elNomeHeader.textContent = usuario.nome || "Usuário";
    if (elBadgeFuncao) elBadgeFuncao.textContent = formatarNomeFuncao(usuario.funcao);

    if (inputNome) inputNome.value = usuario.nome || "";
    if (inputEmail) inputEmail.value = usuario.email || "";
    if (selectFuncao) selectFuncao.value = usuario.funcao || "leitor";
}

function formatarNomeFuncao(funcao) {
    const mapa = {
        'admin': 'Administrador',
        'editor': 'Editor',
        'jornalista': 'Jornalista',
        'leitor': 'Leitor'
    };
    return mapa[funcao] || 'Leitor';
}

function configurarFormularioPerfil(usuarioSessao) {
    const form = document.getElementById("form-meu-perfil");
    const feedback = document.getElementById("mensagem-perfil-feedback");
    const btnSalvar = document.getElementById("btn-salvar-perfil");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("perfil-nome").value.trim();
        const email = document.getElementById("perfil-email").value.trim();
        const senha = document.getElementById("perfil-senha").value;

        // Oculta feedback anterior
        if (feedback) {
            feedback.className = "feedback-perfil escondido";
            feedback.textContent = "";
        }

        // Monta o payload garantindo que NÃO alteramos o campo 'funcao' no payload do usuário
        const payloadAtualizacao = {
            nome,
            email
        };

        // Envia o campo senha somente se o usuário digitou uma nova senha
        if (senha && senha.trim() !== "") {
            payloadAtualizacao.senha = senha;
        }

        try {
            if (btnSalvar) {
                btnSalvar.disabled = true;
                btnSalvar.textContent = "Salvando...";
            }

            const urlUsuario = `${API_URL_USUARIOS}/${usuarioSessao.id || usuarioSessao._id}`;

            const resposta = await fetch(urlUsuario, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${usuarioSessao.token}`
                },
                body: JSON.stringify(payloadAtualizacao)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.mensagem || resultado.error || "Erro ao atualizar perfil.");
            }

            // Atualiza os dados salvos no localStorage
            const novaSessao = {
                ...usuarioSessao,
                nome: resultado.usuario ? resultado.usuario.nome : nome,
                email: resultado.usuario ? resultado.usuario.email : email
            };

            localStorage.setItem("gajeiro_usuario", JSON.stringify(novaSessao));

            if (feedback) {
                feedback.textContent = "Perfil atualizado com sucesso!";
                feedback.className = "feedback-perfil sucesso";
            }

            // Atualiza o título do card
            preencherDadosFormulario(novaSessao);

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            if (feedback) {
                feedback.textContent = error.message;
                feedback.className = "feedback-perfil erro";
            }
        } finally {
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = `<i class="bi bi-check-circle-fill"></i> Salvar Alterações`;
            }
        }
    });
}

