import axios from 'axios';

/**
 * Water Data Service
 * Fetches and manages water-related data from ETL pipeline
 */

// Configure base path for ETL data (adjust based on your setup)
const ETL_DATA_PATH = `${import.meta.env.BASE_URL}data`; // Served from public folder or static

export const waterDataService = {
  /**
   * Fetch embassaments data with optional filtering
   */
  async getEmbassaments() {
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/embassaments.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching embassaments:', error);
      throw error;
    }
  },

  /**
   * Fetch precipitation data
   */
  async getPrecipitation() {
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/precipitation.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching precipitation:', error);
      throw error;
    }
  },

  /**
   * Fetch pipeline metadata
   */
  async getMetadata() {
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/metadata.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  /**
   * Get embassaments grouped by name
   */
  groupEmbassamentsByName(records) {
    const grouped = {};
    records.forEach(record => {
      if (!grouped[record.name]) {
        grouped[record.name] = [];
      }
      grouped[record.name].push(record);
    });
    return grouped;
  },

  /**
   * Get latest record for each embassament
   */
  getLatestEmbassaments(records) {
    const latest = {};
    records.forEach(record => {
      if (!latest[record.name] || new Date(record.date) > new Date(latest[record.name].date)) {
        latest[record.name] = record;
      }
    });
    return Object.values(latest);
  },

  /**
   * Get embassaments within date range
   */
  filterEmbassamentsByDateRange(records, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return records.filter(record => {
      const recordTime = new Date(record.date).setHours(12, 0, 0, 0); // Normalize time to noon
      return recordTime >= start && recordTime <= end;
    });
  },

  /**
   * Get precipitation by station
   */
  filterPrecipitationByStation(records, stationName) {
    return records.filter(r => r.stationName === stationName);
  },

  /**
   * Get precipitation within date range
   */
  filterPrecipitationByDateRange(records, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return records.filter(record => {
      const recordTime = new Date(record.date).setHours(12, 0, 0, 0); // Normalize time to noon
      return recordTime >= start && recordTime <= end;
    });
  },

  /**
   * Get unique stations from precipitation data
   */
  getAvailableStations(precipitationData) {
    if (!precipitationData || !precipitationData.records) return [];
    const stations = [...new Set(precipitationData.records.map(r => r.stationName))];
    return stations.sort();
  },

  /**
   * Calculate status color based on percentage
   */
  getStatusColor(percentage) {
    if (percentage < 20) return '#FF4444'; // Critical - Red
    if (percentage < 50) return '#FFB700'; // Warning - Orange
    if (percentage < 75) return '#44AA44'; // Normal - Green
    return '#1E7E1E'; // Optimal - Dark Green
  },

  /**
   * Format percentage with color
   */
  formatStatusWithColor(percentage) {
    return {
      percentage,
      color: this.getStatusColor(percentage),
      status: percentage < 20 ? 'critical' : percentage < 50 ? 'warning' : percentage < 75 ? 'normal' : 'optimal',
    };
  },
};

export default waterDataService;
