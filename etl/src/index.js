/**
 * ETL Pipeline - Main Entry Point
 * 
 * Aquest script executa tot el procés ETL:
 * 1. Extract: Obtenir dades de les APIs de la Generalitat
 * 2. Transform: Processar i estructurar les dades
 * 3. Load: Guardar les dades en format JSON
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Iniciando ETL Pipeline...')

// Crear directoris si no existeixen
const dataDir = path.join(__dirname, '../data')
const logsDir = path.join(__dirname, '../logs')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

console.log('✅ ETL Pipeline estruturado correctamente')
console.log(`📁 Data directory: ${dataDir}`)
console.log(`📁 Logs directory: ${logsDir}`)
