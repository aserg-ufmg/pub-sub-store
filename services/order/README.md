# Serviço que processa um pedido

Este projeto corresponde a uma aplicaçao em node.js, que processa um pedido da loja de disco de vinil, as solicitações dos pedidos da loja tem este formato: 

```json
{
    "name": "NOME_DO_CLIENTE",
    "email": "EMAIL_DO_CLIENTE",
    "cpf": "CPF_DO_CLIENTE",
    "creditCard": {
        "number": "NUMERO_DO_CARTAO_DE_CREDITO",
        "securityNumber": "CODIGO_DE_SEGURANCA"
    },
    "products": [
        {
            "name": "NOME_DO_PRODUTO",
            "value": "VALOR_DO_PRODUTO"
        }
    ],
    "address": {
        "zipCode": "CEP",
        "street": "NOME_DA_RUA",
        "number": "NUMERO_DA_RESIDENCIA",
        "neighborhood": "NOME_DO_BAIRO",
        "city": "NOME_DA CIDADE",
        "state": "NOME_DO_ESTADO"
    }
}
```

Antes de executar a aplicação é necessário atualizar as informações do arquivo de configuração `.env` com as seguintes variaveis:

````js
RABBITMQ_LOGIN          = guest 
RABBITMQ_PASSWORD       = guest
RABBITMQ_HOST           = localhost
RABBITMQ_PORT           = 5672
RABBITMQ_VHOST          = 
RABBITMQ_QUEUE_NAME     = orders //nome da fila de onde ira consumir a informaçào
````

