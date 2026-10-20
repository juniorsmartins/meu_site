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
    const iconeBloqueio = document.querySelector(".icone-bloqueio");
    const subtextoBloqueio = document.querySelector(".subtexto-bloqueio");

    // CORREÇÃO: Utilizando o parâmetro 'usuario' enviado para a função, evitando o ReferenceError
    if (elNomeHeader) elNomeHeader.textContent = usuario.nome || "Usuário";
    if (elBadgeFuncao) elBadgeFuncao.textContent = formatarNomeFuncao(usuario.funcao);

    if (inputNome) inputNome.value = usuario.nome || "";
    if (inputEmail) inputEmail.value = usuario.email || "";
    if (selectFuncao) selectFuncao.value = usuario.funcao || "leitor";

    // LIBERAÇÃO PARA ADMINISTRADOR:
    // Se o usuário logado na sessão possuir a função 'admin', destravamos o campo select
    if (usuario.funcao === 'admin' && selectFuncao) {
        selectFuncao.disabled = false; // Habilita o campo de seleção
        selectFuncao.classList.remove("campo-desabilitado"); // Remove o estilo cinza de desativado
        
        if (iconeBloqueio) iconeBloqueio.style.display = "none"; // Oculta o ícone do cadeado
        if (subtextoBloqueio) {
            subtextoBloqueio.textContent = "Modo Administrador: Você pode alterar a função deste usuário.";
            subtextoBloqueio.style.color = "var(--blue-700)";
        }
    }
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
        const funcao = document.getElementById("perfil-funcao");

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

        // Se o select de função estiver habilitado (significa que é admin), incluímos a nova função no payload
        if (funcao && !funcao.disabled) {
            payloadAtualizacao.funcao = funcao.value;
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
                email: resultado.usuario ? resultado.usuario.email : email,
                funcao: resultado.usuario ? resultado.usuario.funcao : usuarioSessao.funcao
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

            // --- FLUXO DE ERRO / RECUPERAÇÃO ---
            // 1. Exibe a mensagem de erro do backend (ex: "Não é possível alterar a função do último administrador...")
            if (feedback) {
                feedback.textContent = error.message;
                feedback.className = "feedback-perfil erro";
            }

            // 2. RESTAURAÇÃO: Reseta o formulário de volta para os dados originais salvos na sessão (localStorage)
            preencherDadosFormulario(usuarioSessao);

            // 3. Limpa o campo de senha por segurança
            const inputSenha = document.getElementById("perfil-senha");
            if (inputSenha) inputSenha.value = "";

        } finally {
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = `<i class="bi bi-check-circle-fill"></i> Salvar Alterações`;
            }
        }
    });
}

