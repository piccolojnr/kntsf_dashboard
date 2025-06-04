// src/main/auth-storage.ts
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { log } from './logger'

const filePath = path.join(app.getPath('userData'), 'auth.json')

export const saveToken = (token: string): void => {
  fs.writeFileSync(filePath, JSON.stringify({ token }), 'utf-8')
}

export const loadToken = (): string | null => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data).token
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File does not exist, return null
      return null
    }
    log.error('Failed to load token:', error)
    return null
  }
}

export const clearToken = (): void => {
  try {
    fs.unlinkSync(filePath)
  } catch (error: any) {
    // Ignore error if file does not exist
    log.error('Failed to clear token:', error)
  }
}
