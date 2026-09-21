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

    const formData = new FormData(event.target);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const mensagem = formData.get('mensagem');

    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Mensagem:', mensagem);
}





