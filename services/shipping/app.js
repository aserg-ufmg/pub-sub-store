const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

async function processMessage(msg) {
    const deliveryData = JSON.parse(msg.content)
    try {
        if(deliveryData.address && deliveryData.address.zipCode) {
            console.log(`✔ SUCCESSOOOOO!!!!, SHIPPING AUTHORIZED, SEND TO:`)
            console.log(deliveryData.address)
        } else {
            console.log(`X ERROR, 'NÓS' CAN'T SEND WITHOUT ZIPCODE :'(`)
        }
        await (await RabbitMQService.getInstance()).send('report', deliveryData)

    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILAAAAA do shipping: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
} 

consume()
