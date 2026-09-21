/** 
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        contato(event);
    });
});
*/

function contato(event) {
    event.preventDefault(); /* Impede o envio padrão do formulário */

    const formData = new FormData(event.target); /* Cria um objeto FormData a partir do formulário */
    const nome = formData.get('nome');
    const email = formData.get('email');
    const mensagem = formData.get('mensagem');

    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Mensagem:', mensagem);

    alert("Contato enviado com sucesso!"); /* Exibe uma mensagem de sucesso */
    event.target.reset(); /* Limpa o formulário após o envio */
}





