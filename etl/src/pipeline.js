/**
 * Complete ETL Pipeline
 * 
 * Orchestrates the entire Extract -> Transform -> Load process
 */

import { runExtraction } from './extractors/index.js'
import { runTransformation } from './transformers/index.js'
import { runLoad } from './loaders/index.js'

async function runPipeline() {
  const startTime = Date.now()
  
  console.log('====================================')
  console.log('  Water Data ETL Pipeline')
  console.log('====================================')
  console.log(`Started at: ${new Date().toLocaleString()}\n`)
  
  try {
    // Phase 1: Extract
    const extractedData = await runExtraction()
    
    // Phase 2: Transform
    const transformedData = runTransformation(extractedData)
    
    // Phase 3: Load
    runLoad(transformedData)
    
    // Success
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('\n====================================')
    console.log('✅ ETL Pipeline completed successfully!')
    console.log(`Duration: ${duration}s`)
    console.log('====================================\n')
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.error('\n====================================')
    console.error('❌ ETL Pipeline failed!')
    console.error(`Duration: ${duration}s`)
    console.error('Error:', error.message)
    console.error('====================================\n')
    
    process.exit(1)
  }
}

// Run pipeline
runPipeline()
