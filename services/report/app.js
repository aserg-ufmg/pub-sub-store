// services/report/app.js
const RabbitMQService = require('./rabbitmq-service'); // Agora sabemos como ele funciona!
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

var report = {}; 

async function updateReport(products) {
    if (!products || !Array.isArray(products)) { // Verificação adicional
        console.warn("Tentativa de atualizar relatório sem produtos válidos.");
        return;
    }
    for (let product of products) {
        if (!product.name) {
            continue;
        } else if (!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    console.log("--- Relatório Agregado de Vendas ---");
    if (Object.keys(report).length === 0) {
        console.log("Nenhuma venda processada ainda para o relatório agregado.");
    } else {
        for (const [key, value] of Object.entries(report)) {
            console.log(`${key}: ${value} unidade(s) vendida(s)`);
        }
    }
    console.log("------------------------------------");
}

async function imprimirDadosBasicosDaCompra(dadosCompra) {
    console.log("\n--- Dados Básicos da Compra Recebida para Relatório ---");
    if(dadosCompra && dadosCompra.name && dadosCompra.email) {
        console.log(`Cliente: ${dadosCompra.name} (Email: ${dadosCompra.email}, CPF: ${dadosCompra.cpf || 'N/A'})`);
    } else {
        console.log("Dados do cliente incompletos ou ausentes.");
    }
    
    if (dadosCompra && dadosCompra.address) {
        console.log(`Endereço de Entrega: ${dadosCompra.address.street || 'N/A'}, Nº ${dadosCompra.address.number || 'N/A'}, ${dadosCompra.address.neighborhood || 'N/A'}, ${dadosCompra.address.city || 'N/A'} - ${dadosCompra.address.state || 'N/A'}, CEP: ${dadosCompra.address.zipCode || 'N/A'}`);
    } else {
        console.log("Dados de endereço ausentes.");
    }

    console.log("Produtos:");
    if (dadosCompra && dadosCompra.products && Array.isArray(dadosCompra.products)) {
        if (dadosCompra.products.length > 0) {
            dadosCompra.products.forEach(p => {
                console.log(`  - Produto: ${p.name || 'Produto sem nome'}, Valor: ${p.value || 'N/A'}`);
            });
            await updateReport(dadosCompra.products); // Atualiza o relatório agregado
        } else {
            console.log("  Nenhum produto na lista.");
        }
    } else {
        console.log("  Lista de produtos ausente ou em formato incorreto.");
    }
    console.log("----------------------------------------------------");
}

async function consume() {
    console.log("Iniciando consumidor do serviço de relatório...");
    try {
        const rabbitMQServiceInstance = await RabbitMQService.getInstance(); 
        const QUEUE_NAME = 'report'; 

        console.log(`[*] Aguardando mensagens na fila ${QUEUE_NAME}. Para sair, pressione CTRL+C`);

        // O callback que será executado para cada mensagem consumida
        const processMessageCallback = async (msg) => {
            if (msg !== null) {
                const mensagemOriginal = msg.content.toString();
                console.log(`\n[x] Recebido da fila '${QUEUE_NAME}': '${mensagemOriginal}'`);
                try {
                    const dadosCompra = JSON.parse(mensagemOriginal);
                    await imprimirDadosBasicosDaCompra(dadosCompra);
                    
                    // Não é necessário channel.ack(msg) por causa do { noAck: true } no RabbitMQService
                } catch (e) {
                    console.error("Erro ao processar mensagem JSON: ", e.message || e);
                    console.error("Mensagem original com problema: ", mensagemOriginal);
                    // Com noAck: true, se houver um erro aqui, a mensagem já foi removida da fila.
                    // Para um sistema mais robusto, usaríamos noAck: false e chamaríamos channel.nack() aqui.
                }
            }
        };
        
        // Chama o método consume do nosso RabbitMQService
        await rabbitMQServiceInstance.consume(QUEUE_NAME, processMessageCallback);

    } catch (error) {
        console.error("Erro fatal ao iniciar o consumidor ou conectar ao RabbitMQ:", error.message || error);
        console.log("Tentando reconectar em 5 segundos...");
        setTimeout(consume, 5000); 
    }
}

consume();

// Opcional: Imprimir o relatório agregado de tempos em tempos
setInterval(async () => {
    console.log("\n--- Impressão Periódica do Relatório Agregado ---");
    await printReport();
}, 60000); // A cada 60 segundos