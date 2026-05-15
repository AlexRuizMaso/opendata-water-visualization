import axios from 'axios';
import config from '../config.js';

/**
 * Extractor for Catalan Government Precipitation Data
 * Fetches daily precipitation and meteorological data from XEMA stations
 */
class PrecipitationExtractor {
  constructor() {
    this.apiUrl = config.socrata.precipitation.apiUrl;
    this.timeout = config.socrata.timeout;
    this.maxRecords = config.socrata.maxRecords;

    // Precipitation variable code
    this.precipitationVariableCode = '1300'; // Precipitació acumulada diària
  }

  /**
   * Fetch all precipitation data
   * @returns {Promise<Array>} Array of precipitation records
   */
  async extract() {
    try {
      console.log('\n🔄 Extracting Precipitation Data...');
      console.log(`API URL: ${this.apiUrl}`);

      const response = await axios.get(this.apiUrl, {
        params: {
          $order: 'data_lectura DESC',
          $limit: this.maxRecords,
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Water-Visualization-ETL/1.0',
        },
      });

      const records = response.data;
      console.log(`✅ Successfully extracted ${records.length} precipitation records`);

      // Show coverage
      const stations = [...new Set(records.map(r => r.nom_estacio))];
      const variables = [...new Set(records.map(r => r.nom_variable))];
      
      console.log(`📍 Found ${stations.length} weather stations`);
      console.log(`📊 Found ${variables.length} variable types`);

      return records;
    } catch (error) {
      console.error('❌ Error extracting precipitation data:', error.message);
      if (error.response?.status === 404) {
        console.error('   Dataset not found. Check dataset ID in config.');
      } else if (error.code === 'ECONNABORTED') {
        console.error('   Request timeout. API may be slow or unreachable.');
      }
      throw error;
    }
  }

  /**
   * Extract only precipitation records (variable code 1300)
   * @returns {Promise<Array>} Precipitation records only
   */
  async extractPrecipitationOnly() {
    try {
      console.log('\n🔄 Extracting Precipitation Data (1300 - Precipitació diària)...');

      const response = await axios.get(this.apiUrl, {
        params: {
          $where: `codi_variable = '${this.precipitationVariableCode}'`,
          $order: 'data_lectura DESC',
          $limit: this.maxRecords,
        },
        timeout: this.timeout,
      });

      console.log(`✅ Extracted ${response.data.length} precipitation records`);

      // Show station coverage
      const stations = [...new Set(response.data.map(r => r.nom_estacio))];
      console.log(`📍 Coverage from ${stations.length} weather stations`);

      return response.data;
    } catch (error) {
      console.error('❌ Error extracting precipitation:', error.message);
      throw error;
    }
  }

  /**
   * Extract precipitation data for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Precipitation records in range
   */
  async extractDateRange(startDate, endDate) {
    try {
      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];

      console.log(`\n🔄 Extracting Precipitation (${startISO} to ${endISO})...`);

      const response = await axios.get(this.apiUrl, {
        params: {
          $where: `codi_variable = '${this.precipitationVariableCode}' AND data_lectura >= '${startISO}T00:00:00' AND data_lectura <= '${endISO}T23:59:59'`,
          $order: 'data_lectura DESC',
          $limit: this.maxRecords,
        },
        timeout: this.timeout,
      });

      console.log(`✅ Extracted ${response.data.length} records in date range`);
      return response.data;
    } catch (error) {
      console.error('❌ Error extracting date range:', error.message);
      throw error;
    }
  }

  /**
   * Get list of all available weather stations
   * @returns {Promise<Array>} Array of station names
   */
  async getStationsList() {
    try {
      console.log('\n🔄 Fetching Weather Stations List...');

      const response = await axios.get(this.apiUrl, {
        params: {
          $select: 'DISTINCT nom_estacio, codi_estacio',
          $order: 'nom_estacio ASC',
          $limit: 1000,
        },
        timeout: this.timeout,
      });

      const stations = response.data
        .map(r => ({ 
          name: r.nom_estacio, 
          code: r.codi_estacio 
        }))
        .filter(s => s.name && s.code)
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`📍 Found ${stations.length} weather stations:`);
      stations.slice(0, 10).forEach((s, i) => 
        console.log(`   ${i + 1}. ${s.name} (${s.code})`)
      );
      if (stations.length > 10) {
        console.log(`   ... and ${stations.length - 10} more`);
      }

      return stations;
    } catch (error) {
      console.error('❌ Error fetching stations list:', error.message);
      throw error;
    }
  }

  /**
   * Get available meteorological variables
   * @returns {Promise<Array>} Array of available variables
   */
  async getVariablesList() {
    try {
      console.log('\n🔄 Fetching Available Variables...');

      const response = await axios.get(this.apiUrl, {
        params: {
          $select: 'DISTINCT codi_variable, nom_variable, unitat',
          $order: 'codi_variable ASC',
          $limit: 1000,
        },
        timeout: this.timeout,
      });

      const variables = response.data
        .filter(r => r.codi_variable && r.nom_variable)
        .sort((a, b) => a.codi_variable.localeCompare(b.codi_variable));

      console.log(`📊 Found ${variables.length} meteorological variables:`);
      variables.forEach(v => 
        console.log(`   ${v.codi_variable}: ${v.nom_variable} (${v.unitat || 'N/A'})`)
      );

      return variables;
    } catch (error) {
      console.error('❌ Error fetching variables:', error.message);
      throw error;
    }
  }

  /**
   * Extract data for specific station and date range
   * @param {string} stationName - Name of weather station
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Records for station in date range
   */
  async extractByStation(stationName, startDate, endDate) {
    try {
      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];

      console.log(`\n🔄 Extracting data for station: ${stationName}`);

      const response = await axios.get(this.apiUrl, {
        params: {
          $where: `nom_estacio = '${stationName}' AND codi_variable = '${this.precipitationVariableCode}' AND data_lectura >= '${startISO}T00:00:00' AND data_lectura <= '${endISO}T23:59:59'`,
          $order: 'data_lectura DESC',
          $limit: this.maxRecords,
        },
        timeout: this.timeout,
      });

      console.log(`✅ Extracted ${response.data.length} records for ${stationName}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error extracting data for station ${stationName}:`, error.message);
      throw error;
    }
  }
}

export default PrecipitationExtractor;
