# Serviço de report

Este é um modelo para o nosso serviço de reportes das vendas que nossa loja ja fez até o momento. Nele temos uma estrutura de apoio com funçoes para atualizar nosso report e visualizar os resultados. 
Entretanto nosso modelo ainda não esta recebendo as mensagens da fila, está função cabe a você implementar. 

Obs: Este é um exemplo de como pode ser criado o serviço de report, sinta-se avontade para melhora-ló ou mudar de linguagm.  Fique atento apenas ao padrão da mensagem que esta sendo publicada na fila. O seu serviço ira receber um json conforme ilustrado abaixo:

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