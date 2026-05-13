/**
 * Load Module
 * 
 * Saves transformed data to JSON files
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../data')

export function saveXEMAData(data) {
  const filename = `xema_${new Date().toISOString().split('T')[0]}.json`
  const filepath = path.join(DATA_DIR, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
  console.log(`✅ XEMA data saved: ${filename}`)
  
  return filepath
}

export function saveReservoirData(data) {
  const filename = `reservoirs_${new Date().toISOString().split('T')[0]}.json`
  const filepath = path.join(DATA_DIR, filename)
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
  console.log(`✅ Reservoir data saved: ${filename}`)
  
  return filepath
}

export function saveLatestData(allData) {
  // Save a "latest" file for easy access
  const latestData = {
    xema: allData.xema,
    reservoirs: allData.reservoirs,
    lastUpdated: new Date().toISOString()
  }
  
  const latestPath = path.join(DATA_DIR, 'latest.json')
  fs.writeFileSync(latestPath, JSON.stringify(latestData, null, 2))
  console.log(`✅ Latest data index saved: latest.json`)
  
  return latestPath
}

export function runLoad(transformedData) {
  console.log('\n🔄 Starting load phase...\n')
  
  try {
    saveXEMAData(transformedData.xema)
    saveReservoirData(transformedData.reservoirs)
    saveLatestData(transformedData)
    
    console.log('✅ All data loaded successfully!')
    return true
  } catch (error) {
    console.error('❌ Load failed:', error)
    throw error
  }
}
