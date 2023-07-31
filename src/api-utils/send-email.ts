import fs from 'fs'
import Handlebars from 'handlebars'
import nodemailer from 'nodemailer'
import path from 'path'
import { SendEmailUser } from '@/types'
import { logger } from './logger'
import { SEND_EMAIL_ERROR, SEND_EMAIL_SUCCESS } from './constants'

export const sendEmail = async (
  products: SendEmailUser['products'],
  userEmail: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL ?? '',
        pass: process.env.PASSWORD ?? '',
      },
    })

    const mailerOptions = {
      from: process.env.SENDER_EMAIL ?? '',
      to: [userEmail],
      subject: 'Available Products',
      html: getHtml(products),
    }

    await transporter.sendMail(mailerOptions)
    logger.info(
      SEND_EMAIL_SUCCESS(userEmail, products.map(({ id }) => id).join(', '))
    )
  } catch (error) {
    logger.error(SEND_EMAIL_ERROR(userEmail, error))
  }
}

const getHtml = (products: SendEmailUser['products']) => {
  const apiUtilsDirectory = path.resolve(process.cwd(), 'src/api-utils')
  const htmlContent = fs.readFileSync(
    path.join(apiUtilsDirectory, './templates/products-email.html'),
    'utf-8'
  )
  const template = Handlebars.compile(htmlContent)
  return template({ products })
}
