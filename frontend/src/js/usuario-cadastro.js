import { API_URL_USUARIOS } from './constantsConfig.js';

document.addEventListener("DOMContentLoaded", () => {
    configurarFormularioCadastro();
});

function configurarFormularioCadastro() {
    const formCadastro = document.getElementById("form-cadastro-usuario");
    if (!formCadastro) return;

    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputNome = document.getElementById("input-cadastro-nome");
        const inputEmail = document.getElementById("input-cadastro-email");
        const inputSenha = document.getElementById("input-cadastro-senha");
        const inputConfirmarSenha = document.getElementById("input-cadastro-confirmar-senha");
        
        const msgErro = document.getElementById("msg-erro-cadastro");
        const msgSucesso = document.getElementById("msg-sucesso-cadastro");
        const btnSubmeter = document.getElementById("btn-submeter-cadastro");

        // Oculta mensagens de erro/sucesso prévias
        ocultarElemento(msgErro);
        ocultarElemento(msgSucesso);

        const nome = inputNome ? inputNome.value.trim() : "";
        const email = inputEmail ? inputEmail.value.trim() : "";
        const senha = inputSenha ? inputSenha.value : "";
        const confirmarSenha = inputConfirmarSenha ? inputConfirmarSenha.value : "";

        // Validação básica no Front-end
        if (senha !== confirmarSenha) {
            exibirMensagem(msgErro, "As senhas digitadas não coincidem.");
            return;
        }

        // if (senha.length < 3) {
        //     exibirMensagem(msgErro, "A senha deve conter no mínimo 3 caracteres.");
        //     return;
        // }

        try {
            btnSubmeter.disabled = true;
            btnSubmeter.innerHTML = `<i class="bi bi-arrow-repeat spin"></i> Criando conta...`;

            // Requisição ao Backend
            const resposta = await fetch(API_URL_USUARIOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok || !dados.sucesso) {
                throw new Error(dados.mensagem || "Não foi possível realizar o cadastro.");
            }

            // Exibe mensagem de sucesso
            exibirMensagem(msgSucesso, dados.mensagem || "Conta criada com sucesso! Redirecionando para o login...");
            formCadastro.reset();

            // Redireciona para a página principal após 2.5 segundos para o usuário entrar com suas credenciais
            setTimeout(() => {
                window.location.href = "/html/index.html";
            }, 2500);

        } catch (error) {
            console.error("Erro no cadastro de usuário:", error);
            exibirMensagem(msgErro, error.message);

        } finally {
            btnSubmeter.disabled = false;
            btnSubmeter.innerHTML = `<i class="bi bi-check-circle-fill"></i> Concluir Cadastro`;
        }
    });
}

function exibirMensagem(elemento, texto) {
    if (elemento) {
        elemento.textContent = texto;
        elemento.classList.remove("escondido");
    }
}

function ocultarElemento(elemento) {
    if (elemento) {
        elemento.classList.add("escondido");
        elemento.textContent = "";
    }
}

