document.addEventListener("DOMContentLoaded", async () => {
    const carrosselContainer = document.getElementById("carrossel-container");

    if (!carrosselContainer) {
        return;
    }

    try {
        const response = await fetch("../html/carrossel.html");

        if (!response.ok) {
            throw new Error(`Erro ao carregar carrossel.html: ${response.status}`);
        }

        carrosselContainer.innerHTML = await response.text();

        await carregarCarrosselDestaque3();

    } catch (error) {
        console.error("Erro no fluxo do carrossel", error);
    }
});

async function carregarCarrosselDestaque3() {

    const carrosselDestaque3 = document.getElementById("carrossel-destaque-3-itens");

    if(!carrosselDestaque3) {
        return;
    }

    const API_URL = "https://meu-site-ashy-omega.vercel.app/api/noticias";
    
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro ao carregar notícias: ${response.status}`);
        }

        const noticias = await response.json();
        const ultimasNoticias = noticias.slice(0, 3);

        const htmlNoticias = ultimasNoticias.map(noticia => `
            <div class="carrossel-destaque-3-itens width-100" style="background-image: url('https://s2-oglobo.glbimg.com/ZGl4RjcFS85aNx33zUp2r7HJ5qE=/0x0:3188x2125/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_da025474c0c44edd99332dddb09cabe8/internal_photos/bs/2025/U/R/rphcytREGRgm1VnZ4GwA/bre14243.jpg')">
                <h3>${noticia.titulo}</h3>
            </div>
        `).join("");

        carrosselDestaque3.innerHTML = htmlNoticias;
        
    } 
    catch (error) {
        console.error("Erro ao carregar notícias secundárias", error);
        carrosselDestaque3.innerHTML = "<p>Erro ao carregar notícias secundárias.</p>";
    }
}




