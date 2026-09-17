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
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const mensagem = document.getElementById('mensagem').value;

    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Mensagem:', mensagem);
}





