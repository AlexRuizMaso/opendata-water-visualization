/**
 * Transform Module
 * 
 * Processes and structures the extracted data
 */

export function transformXEMAData(rawData) {
  // Structure: { station_id, name, location, temperature, precipitation, humidity, etc }
  return rawData.map(record => ({
    id: record.id || record.station_id,
    name: record.name || record.station_name,
    location: {
      latitude: record.latitude || record.lat,
      longitude: record.longitude || record.lon,
      municipality: record.municipality || ''
    },
    measurements: {
      temperature: record.temperature || null,
      precipitation: record.precipitation || null,
      humidity: record.humidity || null,
      windSpeed: record.wind_speed || null
    },
    timestamp: record.timestamp || new Date().toISOString(),
    quality: record.quality || 'good'
  }))
}

export function transformReservoirData(rawData) {
  // Structure: { reservoir_id, name, capacity, current_volume, percentage, etc }
  return rawData.map(record => ({
    id: record.id || record.reservoir_id,
    name: record.name || record.reservoir_name,
    location: {
      latitude: record.latitude || record.lat,
      longitude: record.longitude || record.lon,
      basin: record.basin || ''
    },
    capacity: {
      totalVolume: record.total_volume || null,
      currentVolume: record.current_volume || null,
      percentage: record.percentage_full || null
    },
    timestamp: record.timestamp || new Date().toISOString(),
    status: record.status || 'normal'
  }))
}

export function runTransformation(extractedData) {
  console.log('\n🔄 Starting transformation phase...\n')
  
  try {
    const xemaTransformed = transformXEMAData(extractedData.xema.records)
    const reservoirsTransformed = transformReservoirData(extractedData.reservoirs.records)
    
    return {
      xema: xemaTransformed,
      reservoirs: reservoirsTransformed,
      transformedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Transformation failed:', error)
    throw error
  }
}
