const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')

// Basado en: https://github.com/jkk/micromailer/blob/master/index.js

try {
  dotenv.config()
} catch (error) {
  console.log(error)
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: (process.env.SMTP_SECURE === "true"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls:{
    ciphers:'SSLv3'
  }
})

const app = express()
app.set('port', process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.json({
    message: 'Mailer service is ready.'
  })
})

app.post('/send', (req, res) => {
  try {
    let fromName = (req.body.fromName || process.env.FROM_NAME)
    let toEmail = req.body.toEmail
    let subject = req.body.subject
    let textBody = req.body.textBody
    let htmlBody = req.body.htmlBody

    if (!subject || typeof subject !== 'string') {
      throw new TypeError('Subject was not defined')
      return
    }
    if (!toEmail || typeof toEmail !== 'string') {
      throw new TypeError('To Email was not defined')
      return
    }

    let mailOptions = {
      from: fromName + '<' + process.env.FROM_EMAIL + '>',
      to: toEmail,
      subject: subject,
      text: textBody,
      html: htmlBody
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new TypeError(error.message)
      }
      console.log('Mensaje %s enviado: %s', info.messageId, info.response)
      res.json({
        message: 'Mensaje enviado exitosamente'
      })
    })
  } catch (error) {
    res.status(500)
    res.json({
      error: error.message
    })
    console.error('Ocurrió un error:')
    console.error(error.message)
  }
})

const server = app.listen(app.get('port'), () => {
  const port = server.address().port
  console.log('Mailer service ejecutándose en http://localhost:' + port)
})
