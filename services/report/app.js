const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for (let product of products) {
        if (!product.name) {
            continue
        } else if (!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
    }
}

async function consume() {
    async function processMessage(msg) {
        try {
            const data = JSON.parse(msg.content)
            await updateReport(data.products || [])
            await printReport()
        } catch (error) {
            console.log(`X ERROR TO PROCESS: ${error && error.message ? error.message : error}`)
        }
    }

    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => { processMessage(msg) })
}

consume()

