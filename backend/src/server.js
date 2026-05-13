/**
 * Backend Server (Optional for future enhancements)
 * 
 * This Express server can be used to:
 * - Serve the JSON data files
 * - Cache frequently accessed data
 * - Provide API endpoints for frontend
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/api/data/xema', (req, res) => {
  // TODO: Load latest XEMA data
  res.json({ message: 'XEMA data endpoint' })
})

app.get('/api/data/reservoirs', (req, res) => {
  // TODO: Load latest reservoir data
  res.json({ message: 'Reservoir data endpoint' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
})
