#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/var/www')

print("🧪 Iniciando teste do serviço de relatório...")

try:
    from rabbitmq_service import RabbitMQService
    print("✅ Módulo RabbitMQService importado com sucesso")
    
    service = RabbitMQService()
    print("✅ Instância do serviço criada")
    
    print(f"🔗 Tentando conectar em: {service.host}:{service.port}")
    service.connect()
    print("✅ Conectado ao RabbitMQ com sucesso!")
    
    print("📦 Verificando fila 'report'...")
    queue_info = service.channel.queue_declare(queue='report', passive=True)
    print(f"📊 Fila 'report' tem {queue_info.method.message_count} mensagens")
    
    service.close()
    print("✅ Teste concluído com sucesso!")
    
except Exception as e:
    print(f"❌ Erro durante o teste: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
