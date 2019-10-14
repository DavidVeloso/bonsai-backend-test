import winston from 'winston'

const wLogger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
  )
})

export const logger = {
  debug: (msg: string, ...args: any[]) => wLogger.debug(msg, args),
  error: (msg: string, ...args: any[]) => wLogger.error(msg, args),
  info: (msg: string, ...args: any[]) => wLogger.info(msg, args),
  warn: (msg: string, ...args: any[]) => wLogger.warn(msg, args)
}
