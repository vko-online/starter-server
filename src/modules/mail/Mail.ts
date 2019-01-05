import { InstanceType } from 'typegoose'
import { UserClass } from '@models/user'

const nodemailer = require('nodemailer')

export interface IMail {
  resetPassword (user: InstanceType<UserClass>): void
}

let _account = null
const getAccount = async () => {
  if (_account) return _account

  _account = await nodemailer.createTestAccount()
  return _account
}

export const resetPassword = async (user: InstanceType<UserClass>) => {
  const account = await getAccount()
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    },
    logger: false,
    debug: false // include SMTP traffic in the logs
  }, {
    from: 'MoiSalon <no-reply@moisalon.kz>'
  })

  const mailOptions = {
    to: user.email,
    subject: 'Your Hackathon Starter password has been changed',
    text: `
      Hello,
      This is a confirmation that the password
      for your account ${user.email}
      has just been changed.
    `
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred')
      console.log(error.message)
    } else {
      console.log('Message sent successfully!')
      console.log(nodemailer.getTestMessageUrl(info))
    }
  })
}
