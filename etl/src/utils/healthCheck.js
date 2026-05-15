import axios from 'axios';
import config from '../config.js';

/**
 * Health Check for Catalan Government APIs
 * Verifies that both Embassaments and Precipitation APIs are responsive
 */
class APIHealthCheck {
  constructor() {
    this.embassamentsURL = config.socrata.embassaments.apiUrl;
    this.precipitationURL = config.socrata.precipitation.apiUrl;
    this.timeout = config.healthCheck.timeout;
  }

  /**
   * Test Embassaments API
   * Returns true if API is responsive, false otherwise
   */
  async checkEmbassaments() {
    try {
      const response = await axios.get(this.embassamentsURL, {
        params: { $limit: 1 },
        timeout: this.timeout,
      });
      
      const isValid = Array.isArray(response.data) && response.status === 200;
      console.log(`✅ Embassaments API: ${isValid ? 'HEALTHY' : 'UNHEALTHY'}`);
      return isValid;
    } catch (error) {
      console.error(`❌ Embassaments API: FAILED - ${error.message}`);
      return false;
    }
  }

  /**
   * Test Precipitation API
   * Returns true if API is responsive, false otherwise
   */
  async checkPrecipitation() {
    try {
      const response = await axios.get(this.precipitationURL, {
        params: { $limit: 1 },
        timeout: this.timeout,
      });
      
      const isValid = Array.isArray(response.data) && response.status === 200;
      console.log(`✅ Precipitation API: ${isValid ? 'HEALTHY' : 'UNHEALTHY'}`);
      return isValid;
    } catch (error) {
      console.error(`❌ Precipitation API: FAILED - ${error.message}`);
      return false;
    }
  }

  /**
   * Run full health check on all APIs
   * @returns {Object} Health status with timestamp and individual API statuses
   */
  async runFullHealthCheck() {
    console.log('\n📋 Running API Health Check...');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('-----------------------------------');

    const embassamentsHealth = await this.checkEmbassaments();
    const precipitationHealth = await this.checkPrecipitation();

    const overallStatus = embassamentsHealth && precipitationHealth ? 'HEALTHY' : 'DEGRADED';

    const result = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      apis: {
        embassaments: {
          name: 'Embassaments API',
          status: embassamentsHealth ? 'healthy' : 'unhealthy',
          url: this.embassamentsURL,
        },
        precipitation: {
          name: 'Precipitation API',
          status: precipitationHealth ? 'healthy' : 'unhealthy',
          url: this.precipitationURL,
        },
      },
      allApisHealthy: embassamentsHealth && precipitationHealth,
    };

    console.log('-----------------------------------');
    console.log(`Overall Status: ${overallStatus}`);
    console.log(`All APIs Healthy: ${result.allApisHealthy ? '✅ YES' : '❌ NO'}\n`);

    return result;
  }

  /**
   * Get detailed info about each API
   * Useful for debugging and monitoring
   */
  async getDetailedStatus() {
    const healthStatus = await this.runFullHealthCheck();
    
    try {
      // Get sample records count
      const embRes = await axios.get(this.embassamentsURL, {
        params: { $select: 'COUNT(*)', $limit: 1 },
        timeout: this.timeout,
      });

      const precRes = await axios.get(this.precipitationURL, {
        params: { $select: 'COUNT(*)', $limit: 1 },
        timeout: this.timeout,
      });

      return {
        ...healthStatus,
        recordCounts: {
          embassaments: embRes.data?.[0]?.['COUNT(*)'] || 'unknown',
          precipitation: precRes.data?.[0]?.['COUNT(*)'] || 'unknown',
        },
      };
    } catch (error) {
      console.warn('Could not fetch record counts:', error.message);
      return healthStatus;
    }
  }
}

export default APIHealthCheck;
