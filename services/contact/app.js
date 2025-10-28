const RabbitMQService = require('./rabbitmq-service')
const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')


require('dotenv').config({ path: path.resolve(__dirname, '.env') })

async function processMessage(msg) {
    const deliveryData = JSON.parse(msg.content)
    try {
        if(deliveryData.address && deliveryData.address.zipCode) {
            console.log(`✔ SUCCESS, SHIPPING AUTHORIZED, SEND TO:`)
            console.log(deliveryData.address)
        } else {
            console.log(`X ERROR, WE CAN'T SEND WITHOUT ZIPCODE :'(`)
        }
 
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }

    const orderData = JSON.parse(msg.content)
    try {
        if(isValidOrder(orderData)) {
            await (await RabbitMQService.getInstance()).send('contact', { 
                "clientFullName": orderData.name,
                "to": orderData.email,
                "subject": "Pedido Aprovado",
                "text": `${orderData.name}, seu pedido de disco de vinil acaba de ser aprovado, e esta sendo preparado para entrega!`,
            })
            await (await RabbitMQService.getInstance()).send('shipping', orderData)
            console.log(`✔ ORDER APPROVED`)
        } else {
            await (await RabbitMQService.getInstance()).send('contact', { 
                "clientFullName": orderData.name,
                "to": orderData.email,
                "subject": "Pedido Reprovado",
                "text": `${orderData.name}, seus dados não foram suficientes para realizar a compra :( por favor tente novamente!`,
            })
            console.log(`X ORDER REJECTED`)
        }
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }

    const mailData = JSON.parse(msg.content)
    try {
        const mailOptions = {
            'from': process.env.MAIL_USER,
            'to': `${mailData.clientFullName} <${mailData.to}>`,
            'cc': mailData.cc || null,
            'bcc': mailData.cco || null,
            'subject': mailData.subject,
            'text': mailData.text,
            'attachments': null
        }

        fs.writeFileSync(`${mailOptions.subject}-${mailOptions.to}.json`, JSON.stringify(mailOptions));
        
        console.log(`✔ SUCCESS`)
    } catch (error) {
        console.log(error)
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

async function consume() {
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
} 

consume()
