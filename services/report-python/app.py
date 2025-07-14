import json
import os
from datetime import datetime
from rabbitmq_service import RabbitMQService

def save_report_to_file(report_data):
    """Salva o relatório em um arquivo JSON no diretório reports"""
    try:
        # Criar diretório se não existir
        reports_dir = '/var/www/reports'
        os.makedirs(reports_dir, exist_ok=True)
        
        # Gerar nome do arquivo com timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]  # Remove últimos 3 dígitos dos microssegundos
        filename = f'sales_report_{timestamp}.json'
        filepath = os.path.join(reports_dir, filename)
        
        # Salvar arquivo
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"[RELATÓRIO] Arquivo salvo: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"[ERRO] Falha ao salvar arquivo: {e}")
        return None

def print_report(data):
    """Imprime o relatório no console e salva em arquivo"""
    print("\n" + "="*50)
    print("         RELATÓRIO DE VENDAS")
    print("="*50)
    
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            print(f"[ERRO] Dados inválidos recebidos: {data}")
            return
    
    # Extrair dados
    order_id = data.get('orderId', 'N/A')
    product = data.get('product', 'N/A')
    price = data.get('price', 0)
    customer = data.get('customer', 'N/A')
    timestamp = data.get('timestamp', datetime.now().isoformat())
    
    # Imprimir relatório
    print(f"ID do Pedido: {order_id}")
    print(f"Produto: {product}")
    print(f"Preço: R$ {price:.2f}")
    print(f"Cliente: {customer}")
    print(f"Data/Hora: {timestamp}")
    print("="*50)
    
    # Criar estrutura de relatório mais detalhada
    report_data = {
        "report_type": "sales_report",
        "generated_at": datetime.now().isoformat(),
        "order_details": {
            "order_id": order_id,
            "product": product,
            "price": price,
            "customer": customer,
            "order_timestamp": timestamp
        },
        "summary": {
            "total_amount": price,
            "total_orders": 1
        }
    }
    
    # Salvar em arquivo
    filepath = save_report_to_file(report_data)
    if filepath:
        print(f"[INFO] Relatório também foi salvo em: {filepath}")

def process_message(ch, method, properties, body):
    """Processa a mensagem recebida da fila"""
    try:
        print(f"[DEBUG] Mensagem recebida: {body}")
        
        # Decodificar mensagem
        message_data = body.decode('utf-8')
        
        # Gerar relatório
        print_report(message_data)
        
        # Confirmar processamento da mensagem
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("[INFO] Mensagem processada com sucesso!")
        
    except Exception as e:
        print(f"[ERRO] Falha ao processar mensagem: {e}")
        # Rejeitar mensagem em caso de erro
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

if __name__ == "__main__":
    print("[INFO] Iniciando serviço de relatórios Python...")
    print("[INFO] Aguardando mensagens da fila 'report'...")
    
    # Criar diretório de relatórios se não existir
    try:
        os.makedirs('/var/www/reports', exist_ok=True)
        print("[INFO] Diretório de relatórios criado/verificado: /var/www/reports")
    except Exception as e:
        print(f"[AVISO] Não foi possível criar diretório de relatórios: {e}")
    
    try:
        # Criar instância do serviço RabbitMQ
        rabbitmq_service = RabbitMQService()
        rabbitmq_service.connect()
        
        # Consumir mensagens da fila 'report'
        rabbitmq_service.consume('report', process_message)
    except KeyboardInterrupt:
        print("\n[INFO] Serviço interrompido pelo usuário")
        if 'rabbitmq_service' in locals():
            rabbitmq_service.close()
    except Exception as e:
        print(f"[ERRO] Falha no serviço: {e}")
        if 'rabbitmq_service' in locals():
            rabbitmq_service.close()
