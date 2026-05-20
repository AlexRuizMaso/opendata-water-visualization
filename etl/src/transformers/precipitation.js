/**
 * Transformer for Precipitation Data
 * Normalizes and enriches meteorological records with focus on precipitation
 */
class PrecipitationTransformer {
  constructor() {
    // Variable mappings for easier interpretation
    this.variableNames = {
      '1000': 'temp_avg',
      '1001': 'temp_max',
      '1002': 'temp_min',
      '1003': 'temp_avg_classic',
      '1004': 'temp_amplitude',
      '1100': 'humidity_avg',
      '1102': 'humidity_min',
      '1300': 'precipitation_daily',
      '1301': 'precipitation_daily_8to8',
      '1303': 'precipitation_max_1h',
      '1400': 'solar_irradiance_global',
      '1401': 'solar_irradiance_net',
      '1505': 'wind_speed_avg',
      '1514': 'wind_speed_max',
      '1700': 'evapotranspiration_ref',
    };

    this.variableUnits = {
      '1000': '°C',
      '1001': '°C',
      '1002': '°C',
      '1100': '%',
      '1300': 'mm',
      '1400': 'MJ/m²',
      '1505': 'm/s',
      '1700': 'mm',
    };
  }

  /**
   * Normalize a single precipitation record
   * @param {Object} record - Raw record from API
   * @returns {Object} Normalized record
   */
  normalizeRecord(record) {
    const value = parseFloat(record.valor);

    return {
      id: record.id,
      stationCode: record.codi_estacio,
      stationName: record.nom_estacio,
      date: new Date(record.data_lectura).toISOString(),
      variableCode: record.codi_variable,
      variableName: this.variableNames[record.codi_variable] || record.nom_variable,
      variableLabel: record.nom_variable,
      value: isNaN(value) ? null : value,
      unit: record.unitat || this.variableUnits[record.codi_variable] || '',
      status: record.estat || 'unknown',
    };
  }

  /**
   * Transform all precipitation records
   * @param {Array} records - Raw records from API
   * @returns {Object} Transformed data with metadata
   */
  transform(records) {
    if (!Array.isArray(records)) {
      throw new Error('Expected array of records');
    }

    console.log(`\n🔄 Transforming ${records.length} precipitation records...`);

    const transformed = records
      .map(record => this.normalizeRecord(record))
      .filter(record => this.validateRecord(record));

    console.log(`✅ Transformed ${transformed.length} valid records`);

    // Extract precipitation data specifically
    const precipitationRecords = transformed.filter(r => r.variableCode === '1300');
    console.log(`📊 Found ${precipitationRecords.length} daily precipitation records`);

    // Calculate statistics
    const stats = this.calculateStatistics(precipitationRecords);

    return {
      timestamp: new Date().toISOString(),
      totalRecords: transformed.length,
      precipitationRecords: precipitationRecords.length,
      statistics: stats,
      records: transformed,
      precipitationOnly: precipitationRecords,
      metadata: {
        version: '1.0',
        dataType: 'precipitation',
        sourceAPI: 'https://analisi.transparenciacatalunya.cat',
        lastUpdated: new Date().toISOString(),
        availableVariables: Object.keys(this.variableNames),
      },
    };
  }

  /**
   * Validate a record has required fields
   * @param {Object} record - Record to validate
   * @returns {boolean} True if valid
   */
  validateRecord(record) {
    const required = ['stationName', 'date', 'variableCode', 'value', 'unit'];
    return required.every(field => record[field] !== null && record[field] !== undefined);
  }

  /**
   * Calculate statistics for precipitation
   * @param {Array} records - Precipitation records only
   * @returns {Object} Statistics
   */
  calculateStatistics(records) {
    if (records.length === 0) {
      return {
        totalStations: 0,
        averagePrecipitation: 0,
        maxPrecipitation: 0,
        minPrecipitation: 0,
        totalDaysCovered: 0,
      };
    }

    // O(N) loop to compute values stats, min/max, and date ranges without call stack overhead
    let sum = 0;
    let count = 0;
    let maxPrec = -Infinity;
    let minPrec = Infinity;
    let latestTime = -Infinity;
    let oldestTime = Infinity;
    const stationsSet = new Set();
    const datesSet = new Set();
    let positiveCount = 0;
    let dryCount = 0;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (r.stationName) stationsSet.add(r.stationName);
      if (r.date) {
        datesSet.add(r.date);
        const t = new Date(r.date).getTime();
        if (!isNaN(t)) {
          if (t > latestTime) latestTime = t;
          if (t < oldestTime) oldestTime = t;
        }
      }

      const v = r.value;
      if (v !== null && v !== undefined && !isNaN(v)) {
        sum += v;
        count++;
        if (v > maxPrec) maxPrec = v;
        if (v < minPrec) minPrec = v;
        if (v > 0) positiveCount++;
        if (v === 0) dryCount++;
      }
    }

    const avg = count > 0 ? sum / count : 0;

    return {
      totalStations: stationsSet.size,
      averagePrecipitation: avg.toFixed(2),
      maxPrecipitation: (count > 0 ? maxPrec : 0).toFixed(2),
      minPrecipitation: (count > 0 ? minPrec : 0).toFixed(2),
      totalDaysCovered: datesSet.size,
      daysWithPrecipitation: positiveCount,
      drySituation: (count > 0 ? (dryCount / count) * 100 : 0).toFixed(2) + '%',
      dateRange: {
        latest: latestTime !== -Infinity ? new Date(latestTime).toISOString() : new Date().toISOString(),
        oldest: oldestTime !== Infinity ? new Date(oldestTime).toISOString() : new Date().toISOString(),
      },
    };
  }

  /**
   * Extract only precipitation variable (code 1300)
   * @param {Array} records - All records
   * @returns {Array} Precipitation records only
   */
  filterPrecipitationOnly(records) {
    return records.filter(r => r.variableCode === '1300');
  }

  /**
   * Get latest precipitation for each station
   * @param {Array} records - All records
   * @returns {Object} Latest records grouped by station
   */
  getLatestByStation(records) {
    const precipOnly = this.filterPrecipitationOnly(records);
    const latest = {};

    precipOnly.forEach(record => {
      if (!latest[record.stationName] || new Date(record.date) > new Date(latest[record.stationName].date)) {
        latest[record.stationName] = record;
      }
    });

    return latest;
  }

  /**
   * Group precipitation records by station for time-series
   * @param {Array} records - All records
   * @returns {Object} Records grouped by station name
   */
  groupByStation(records) {
    const precipOnly = this.filterPrecipitationOnly(records);
    const grouped = {};

    precipOnly.forEach(record => {
      if (!grouped[record.stationName]) {
        grouped[record.stationName] = [];
      }
      grouped[record.stationName].push(record);
    });

    // Sort each group by date descending
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return grouped;
  }

  /**
   * Get list of available stations
   * @param {Array} records - All records
   * @returns {Array} Unique station names sorted
   */
  getAvailableStations(records) {
    const precipOnly = this.filterPrecipitationOnly(records);
    const stations = [...new Set(precipOnly.map(r => r.stationName))];
    return stations.sort();
  }

  /**
   * Extract data for specific date range
   * @param {Array} records - All records
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Records in date range
   */
  filterByDateRange(records, startDate, endDate) {
    const precipOnly = this.filterPrecipitationOnly(records);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return precipOnly.filter(r => {
      const recordTime = new Date(r.date).getTime();
      return recordTime >= start && recordTime <= end;
    });
  }

  /**
   * Get precipitation for specific station and date range
   * @param {Array} records - All records
   * @param {string} stationName - Station name
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered records
   */
  filterByStationAndDate(records, stationName, startDate, endDate) {
    let filtered = records.filter(r => r.stationName === stationName);
    return this.filterByDateRange(filtered, startDate, endDate);
  }
}

export default PrecipitationTransformer;
