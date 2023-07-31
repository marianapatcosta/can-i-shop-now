import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf } = format

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

export const logger = createLogger({
  level: 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), myFormat),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.colorize({ all: true }),
    }),
    new transports.File({ filename: 'app.log', level: 'debug' }),
  ],
})
