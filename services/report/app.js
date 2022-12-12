const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function processMessage(msg) {
    const reportData = JSON.parse(msg.content)
    updateReport(reportData.products)
    printReport()
}

async function consume() {
    console.log(
        `✔ INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`
      );

      await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg);}); 

} 

consume()
