import json
import pika
import sys

# Configuração de conexão
credentials = pika.PlainCredentials('guest', 'guest')
parameters = pika.ConnectionParameters(
    host='q-rabbitmq',
    port=5672,
    virtual_host='/',
    credentials=credentials
)

# Mensagem de teste
test_message = {
    "name": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "creditCard": {
        "number": "1234567890123456",
        "securityNumber": "123"
    },
    "products": [
        {
            "name": "Disco de Vinil - Pink Floyd",
            "value": "89.90"
        },
        {
            "name": "Disco de Vinil - The Beatles",
            "value": "79.90"
        }
    ],
    "address": {
        "zipCode": "01234-567",
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP"
    }
}

try:
    # Conecta ao RabbitMQ
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Declara a fila
    channel.queue_declare(queue='report', durable=True, arguments={'x-queue-mode': 'lazy'})
    
    # Publica a mensagem
    channel.basic_publish(
        exchange='',
        routing_key='report',
        body=json.dumps(test_message),
        properties=pika.BasicProperties(delivery_mode=2)  # delivery_mode=2 para mensagem persistente
    )
    
    print("✅ Mensagem de teste enviada para a fila 'report' com sucesso!")
    print("📦 Produtos enviados:")
    for product in test_message['products']:
        print(f"   • {product['name']}: R$ {product['value']}")
    
    connection.close()
    
except Exception as e:
    print(f"❌ Erro ao enviar mensagem: {e}")
    sys.exit(1)
