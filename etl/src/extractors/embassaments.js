import axios from 'axios';
import config from '../config.js';

/**
 * Extractor for Catalan Government Embassaments Data
 * Fetches daily water level data from all reservoirs
 */
class EmbassamentExtractor {
  constructor() {
    this.apiUrl = config.socrata.embassaments.apiUrl;
    this.timeout = config.socrata.timeout;
    this.maxRecords = config.socrata.maxRecords;
  }

  /**
   * Build Socrata Query Language (SoQL) query
   * @param {number} limit - Number of records to fetch
   * @param {number} offset - Starting position for pagination
   * @returns {string} SoQL query string
   */
  buildQuery(limit = 1000, offset = 0) {
    // Order by date descending (most recent first)
    // This helps ensure we get the latest data
    return `$order=dia DESC&$limit=${limit}&$offset=${offset}`;
  }

  /**
   * Fetch embassaments data from API
   * @returns {Promise<Array>} Array of embassament records
   */
  async extract() {
    try {
      console.log('\n🔄 Extracting Embassaments Data...');
      console.log(`API URL: ${this.apiUrl}`);

      const response = await axios.get(this.apiUrl, {
        params: {
          $order: 'dia DESC', // Most recent first
          $limit: this.maxRecords,
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Water-Visualization-ETL/1.0',
        },
      });

      const records = response.data;
      console.log(`✅ Successfully extracted ${records.length} embassament records`);

      // Group by date to show coverage
      const dates = [...new Set(records.map(r => r.dia))];
      console.log(`📅 Data spans ${dates.length} unique dates`);
      console.log(`   Latest: ${dates[0]}`);
      console.log(`   Oldest: ${dates[dates.length - 1]}`);

      return records;
    } catch (error) {
      console.error('❌ Error extracting embassaments data:', error.message);
      if (error.response?.status === 404) {
        console.error('   Dataset not found. Check dataset ID in config.');
      } else if (error.code === 'ECONNABORTED') {
        console.error('   Request timeout. API may be slow or unreachable.');
      }
      throw error;
    }
  }

  /**
   * Fetch only latest data for each embassament
   * Useful for real-time dashboard
   * @returns {Promise<Array>} Latest record for each embassament
   */
  async extractLatest() {
    try {
      console.log('\n🔄 Extracting Latest Embassaments Data...');

      const response = await axios.get(this.apiUrl, {
        params: {
          $order: 'dia DESC',
          $limit: 100, // Fetch more to ensure we get latest for each
        },
        timeout: this.timeout,
      });

      // Group by estaci (embassament name) and keep only latest
      const latestByEstaci = {};
      response.data.forEach(record => {
        if (!latestByEstaci[record.estaci]) {
          latestByEstaci[record.estaci] = record;
        }
      });

      const latestRecords = Object.values(latestByEstaci);
      console.log(`✅ Extracted latest data for ${latestRecords.length} embassaments`);

      return latestRecords;
    } catch (error) {
      console.error('❌ Error extracting latest embassaments:', error.message);
      throw error;
    }
  }

  /**
   * Fetch historical data for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Records within date range
   */
  async extractDateRange(startDate, endDate) {
    try {
      console.log(`\n🔄 Extracting Embassaments Data (${startDate} to ${endDate})...`);

      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];

      const response = await axios.get(this.apiUrl, {
        params: {
          $where: `dia >= '${startISO}T00:00:00' AND dia <= '${endISO}T23:59:59'`,
          $order: 'dia DESC',
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
   * Get metadata about available embassaments
   * @returns {Promise<Array>} List of unique embassaments
   */
  async getEmbassamentsList() {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          $select: 'DISTINCT estaci',
          $limit: 1000,
        },
        timeout: this.timeout,
      });

      const embassaments = response.data
        .map(r => r.estaci)
        .filter(Boolean)
        .sort();

      console.log(`📊 Found ${embassaments.length} embassaments:`);
      embassaments.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));

      return embassaments;
    } catch (error) {
      console.error('❌ Error fetching embassaments list:', error.message);
      throw error;
    }
  }
}

export default EmbassamentExtractor;
