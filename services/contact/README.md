# Serviço que contacta cliente via email

Esta aplicação tem como principal função contactar o cliente via e-mail, informando o status da sua compra.  Ele fica escutando os eventos da fila `contact` e para cada evento recebido tenta realizar o envio de um email:

Para manter o sistema auto contido, ao inves de propriamente enviar um email, a funcáo processMessage irá salvar um arquivo .json com o conteúdo do email, como pode ser visto a baixo:

```JavaScript
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
```

Mas para realizar o envio de um email, bastaria apenas conectar-se com um provedor, como no caso do exemplo abaixo utilizando como provedor o [mailtrap](https://mailtrap.io/), uma ferramenta que permite testar o envio de emails:

```JavaScript
async function processMessage(msg) {
    const mailData = JSON.parse(msg.content)
    try {
        const transporter = await nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: <mailtrap user>,
                pass: <mailtrap senha>
            }
        })

        const mailOptions = {
            'from': process.env.MAIL_USER,
            'to': `${mailData.clientFullName} <${mailData.to}>`,
            'cc': mailData.cc || null,
            'bcc': mailData.cco || null,
            'subject': mailData.subject,
            'text': mailData.text,
            'attachments': null
        }

        await transporter.sendMail(mailOptions)

        console.log(`✔ SUCCESS`)
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}
```


Para executar a aplicação basta ter um docker em execução e digitar o comando abaixo na raiz do projeto:

```
docker-compose up -d --build contact-service
````
 
Assim que o build finalizar, a aplicação irá se conectar com RabbitMQ e ficara escutando notificação de eventos na fila `contact`
