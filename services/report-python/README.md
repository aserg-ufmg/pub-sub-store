# Serviço de Relatório de Vendas (Python)

Este serviço consome mensagens da fila `report` do RabbitMQ e gera relatórios de vendas em tempo real.

## Funcionalidades

- **Consumo de mensagens**: Conecta-se à fila `report` do RabbitMQ
- **Relatório de vendas**: Gera relatórios com:
  - Contagem de produtos vendidos por tipo
  - Total de vendas realizadas
  - Receita total acumulada
  - Data/hora da última atualização
- **Monitoramento em tempo real**: Processa cada venda assim que ela é enviada para a fila

## Estrutura das mensagens

O serviço espera mensagens no seguinte formato JSON:

```json
{
    "name": "NOME_DO_CLIENTE",
    "email": "EMAIL_DO_CLIENTE",
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
        "neighborhood": "NOME_DO_BAIRRO",
        "city": "NOME_DA_CIDADE",
        "state": "NOME_DO_ESTADO"
    }
}
```

## Configuração

As configurações do RabbitMQ são definidas no arquivo `.env`:

```
RABBITMQ_LOGIN=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST=q-rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_VHOST=
RABBITMQ_QUEUE_NAME=report
```

## Execução via Docker

Para executar o serviço via Docker:

```bash
docker-compose up -d --build report-python-service
```

Para ver os logs do serviço:

```bash
docker logs report-python-service
```

## Dependências

- `pika`: Cliente Python para RabbitMQ
- `python-dotenv`: Carregamento de variáveis de ambiente
