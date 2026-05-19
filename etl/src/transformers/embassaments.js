/**
 * Transformer for Embassaments Data
 * Normalizes, validates, and enriches raw embassament records
 */
class EmbassamentTransformer {
  constructor() {
    // Map to normalize embassament names (remove location info)
    this.nameNormalizationMap = {
      'Embassament de Siurana (Cornudella de Montsant)': 'Siurana',
      'Embassament de Riudecanyes': 'Riudecanyes',
      'Embassament de Sant Ponç (Clariana de Cardener)': 'Sant Ponç',
      'Embassament de Sau (Vilanova de Sau)': 'Sau',
      'Embassament de Susqueda (Osor)': 'Susqueda',
      'Embassament de la Llosa del Cavall (Navès)': 'Llosa del Cavall',
      'Embassament de Foix (Castellet i la Gornal)': 'Foix',
      'Embassament de la Baells (Cercs)': 'Baells',
      'Embassament de Darnius Boadella (Darnius)': 'Darnius-Boadella',
    };

    // Coordinates for each embassament (for mapping)
    this.coordinates = {
      'Siurana': { lat: 41.2672, lng: 1.0514 },
      'Riudecanyes': { lat: 41.2881, lng: 1.6294 },
      'Sant Ponç': { lat: 42.0489, lng: 1.6561 },
      'Sau': { lat: 41.8672, lng: 2.1939 },
      'Susqueda': { lat: 41.9833, lng: 2.3833 },
      'Llosa del Cavall': { lat: 42.1250, lng: 1.5556 },
      'Foix': { lat: 41.4172, lng: 1.8500 },
      'Baells': { lat: 42.1375, lng: 1.7931 },
      'Darnius-Boadella': { lat: 42.3500, lng: 2.9333 },
    };
  }

  /**
   * Normalize a single embassament record
   * @param {Object} record - Raw record from API
   * @returns {Object} Normalized record
   */
  normalizeRecord(record) {
    const normalizedName = this.nameNormalizationMap[record.estaci] || record.estaci;
    const coords = this.coordinates[normalizedName] || { lat: null, lng: null };

    return {
      id: `${normalizedName}-${record.dia}`,
      name: normalizedName,
      fullName: record.estaci,
      date: new Date(record.dia).toISOString(),
      absoluteLevel: parseFloat(record.nivell_absolut) || null,
      volumePercentage: parseFloat(record.percentatge_volum_embassat) || null,
      volumeHm3: parseFloat(record.volum_embassat) || null,
      location: {
        lat: coords.lat,
        lng: coords.lng,
      },
      status: this.calculateStatus(parseFloat(record.percentatge_volum_embassat)),
    };
  }

  /**
   * Transform array of raw records
   * @param {Array} records - Raw records from API
   * @returns {Object} Transformed data with metadata
   */
  transform(records) {
    if (!Array.isArray(records)) {
      throw new Error('Expected array of records');
    }

    console.log(`\n🔄 Transforming ${records.length} embassament records...`);

    const transformed = records
      .map(record => this.normalizeRecord(record))
      .filter(record => this.validateRecord(record));

    console.log(`✅ Transformed ${transformed.length} valid records`);

    // Calculate statistics
    const stats = this.calculateStatistics(transformed);

    return {
      timestamp: new Date().toISOString(),
      totalRecords: transformed.length,
      statistics: stats,
      records: transformed,
      metadata: {
        version: '1.0',
        dataType: 'embassaments',
        sourceAPI: 'https://analisi.transparenciacatalunya.cat',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate a record has required fields
   * @param {Object} record - Record to validate
   * @returns {boolean} True if valid
   */
  validateRecord(record) {
    const required = ['name', 'date', 'absoluteLevel', 'volumePercentage', 'volumeHm3'];
    return required.every(field => record[field] !== null && record[field] !== undefined);
  }

  /**
   * Calculate overall statistics
   * @param {Array} records - Transformed records
   * @returns {Object} Statistics object
   */
  calculateStatistics(records) {
    if (records.length === 0) {
      return {
        averageVolumePercentage: 0,
        minVolumePercentage: 0,
        maxVolumePercentage: 0,
        criticalDams: 0,
        normalDams: 0,
        optimalDams: 0,
      };
    }

    const percentages = records.map(r => r.volumePercentage);
    const statuses = records.map(r => r.status);

    return {
      averageVolumePercentage: (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2),
      minVolumePercentage: Math.min(...percentages).toFixed(2),
      maxVolumePercentage: Math.max(...percentages).toFixed(2),
      criticalDams: statuses.filter(s => s === 'critical').length,
      normalDams: statuses.filter(s => s === 'normal').length,
      optimalDams: statuses.filter(s => s === 'optimal').length,
      uniqueEmbassaments: [...new Set(records.map(r => r.name))].length,
      dateRange: {
        latest: new Date(Math.max(...records.map(r => new Date(r.date)))).toISOString(),
        oldest: new Date(Math.min(...records.map(r => new Date(r.date)))).toISOString(),
      },
    };
  }

  /**
   * Calculate status based on volume percentage
   * @param {number} percentage - Volume percentage
   * @returns {string} Status: 'critical', 'normal', or 'optimal'
   */
  calculateStatus(percentage) {
    if (percentage < 20) return 'critical';    // Red zone
    if (percentage < 50) return 'warning';     // Yellow zone
    if (percentage < 75) return 'normal';      // Green zone
    return 'optimal';                          // Dark green
  }

  /**
   * Get latest record for each embassament
   * @param {Array} records - All records
   * @returns {Array} Latest records
   */
  getLatestByEmbassament(records) {
    const latest = {};

    records.forEach(record => {
      if (!latest[record.name] || new Date(record.date) > new Date(latest[record.name].date)) {
        latest[record.name] = record;
      }
    });

    return Object.values(latest);
  }

  /**
   * Group records by embassament name for time-series analysis
   * @param {Array} records - All records
   * @returns {Object} Records grouped by embassament
   */
  groupByEmbassament(records) {
    const grouped = {};

    records.forEach(record => {
      if (!grouped[record.name]) {
        grouped[record.name] = [];
      }
      grouped[record.name].push(record);
    });

    // Sort each group by date descending
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return grouped;
  }
}

export default EmbassamentTransformer;
