import pika
import os
import json
from dotenv import load_dotenv

class RabbitMQService:
    def __init__(self):
        load_dotenv()
        
        self.host = os.getenv('RABBITMQ_HOST', 'localhost')
        self.port = int(os.getenv('RABBITMQ_PORT', 5672))
        self.username = os.getenv('RABBITMQ_LOGIN', 'guest')
        self.password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        vhost_env = os.getenv('RABBITMQ_VHOST', '/')
        self.vhost = '/' if not vhost_env else vhost_env
        
        self.connection = None
        self.channel = None
    
    def connect(self):
        """Estabelece conexão com RabbitMQ"""
        print(f"🔗 Conectando ao RabbitMQ: {self.username}@{self.host}:{self.port}{self.vhost}")
        credentials = pika.PlainCredentials(self.username, self.password)
        parameters = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            virtual_host=self.vhost,
            credentials=credentials
        )
        
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()
        self.channel.basic_qos(prefetch_count=1)
        print("✅ Conexão estabelecida com sucesso!")
    
    def declare_queue(self, queue_name):
        """Declara uma fila com configurações duráveis e lazy"""
        self.channel.queue_declare(
            queue=queue_name,
            durable=True,
            arguments={'x-queue-mode': 'lazy'}
        )
    
    def consume(self, queue_name, callback):
        """Consome mensagens de uma fila"""
        print(f"📦 Declarando fila: {queue_name}")
        self.declare_queue(queue_name)
        print(f"👂 Iniciando consumo da fila: {queue_name}")
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback,
            auto_ack=False
        )
        
        print(f" [*] Aguardando mensagens da fila '{queue_name}'. Para sair pressione CTRL+C")
        self.channel.start_consuming()
    
    def close(self):
        """Fecha a conexão"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
