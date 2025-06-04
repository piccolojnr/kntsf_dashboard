// src/lib/logger.ts
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const logFilePath = path.join(app.getPath('userData'), 'prisma.log')

export const log = Object.assign(
  (...args: any[]): void => {
    log.info(...args)
  },
  {
    error: (...args: any[]) => {
      const logMessage = `[${new Date().toISOString()}] ERROR: ${args.map(String).join(' ')}\n`
      fs.appendFileSync(logFilePath, logMessage)
      console.error(logMessage.trim())
    },
    info: (...args: any[]) => {
      const logMessage = `[${new Date().toISOString()}] INFO: ${args.map(String).join(' ')}\n`
      fs.appendFileSync(logFilePath, logMessage)
      console.log(logMessage.trim())
    },
    warn: (...args: any[]) => {
      const logMessage = `[${new Date().toISOString()}] WARN: ${args.map(String).join(' ')}\n`
      fs.appendFileSync(logFilePath, logMessage)
      console.warn(logMessage.trim())
    },
    debug: (...args: any[]) => {
      const logMessage = `[${new Date().toISOString()}] DEBUG: ${args.map(String).join(' ')}\n`
      fs.appendFileSync(logFilePath, logMessage)
      console.debug(logMessage.trim())
    }
  }
)

log('App starting...')
log(`App version: ${app.getVersion()}`)
log(`App user data path: ${app.getPath('userData')}`)
log(`App log path: ${logFilePath}`)
