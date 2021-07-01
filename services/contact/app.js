const RabbitMQService = require('./rabbitmq-service')
const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')


require('dotenv').config({ path: path.resolve(__dirname, '.env') })

async function processMessage(msg) {
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
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
} 

consume()
