# Conceito

1. API (Application Programming Interface): é a ponte que permite que dois softwares conversem entre si. 

2. API Restful: é uma API que segue uma maneira e organização específica, chamada de arquitetura Rest (Representational State Transfer).

3. Princípios da Arquitetura Rest

    - Cliente-servidor: separa quem pede informação de quem processa e guarda. O front-end (cliente) e o back-end (servidor) são separados e evoluem de forma independente.

    - Sem estado (stateless): cada requisição do cliente para o servidor deve conter todas as informações necessárias para entendê-la. O servidor não guarda lembrança das requisições anteriores.

    - Cacheável: as respostas devem indicar se podem ou não ser armazenadas em cache, para melhorar o desempenho.

    - Interface uniforme: padroniza a comunicação com: Recursos identificados por URLs (ex.: /usuarios/1); Uso correto dos métodos HTTP: GET (ler), POST (criar), PUT/PATCH (atualizar), DELETE (remover); Representações dos dados, geralmente em JSON; Mensagens autodescritivas (com códigos de status como 200, 404, 500)

    - Sistema em camadas: o cliente não precisa saber se está falando direto com o servidor final ou com intermediários (proxies, balanceadores, etc.).

    - Código sob demanda: o servidor pode enviar códigos executáveis (como scripts JavaScript) para o cliente rodar.



