import axios from 'axios';
import { normalizeStationName } from '../utils/stationNameMap.js';

const ETL_DATA_PATH = `${import.meta.env.BASE_URL}data`;

const precipitationCache = new Map();

export const waterDataService = {
  async getEmbassaments() {
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/embassaments.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching embassaments:', error);
      throw error;
    }
  },

  async getPrecipitation() {
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/precipitation.json`);
      const data = response.data;
      if (data.records) {
        data.records.forEach(r => {
          r.stationName = normalizeStationName(r.stationName);
        });
      }
      return data;
    } catch (error) {
      console.error('Error fetching precipitation:', error);
      throw error;
    }
  },

  async getPrecipitationByYear(year) {
    if (precipitationCache.has(year)) {
      return precipitationCache.get(year);
    }
    try {
      const response = await axios.get(`${ETL_DATA_PATH}/precipitation_${year}.json`);
      const data = response.data;
      if (data.records) {
        data.records.forEach(r => {
          r.stationName = normalizeStationName(r.stationName);
        });
      }
      precipitationCache.set(year, data);
      return data;
    } catch (error) {
      console.error(`Error fetching precipitation for year ${year}:`, error);
      throw error;
    }
  },

  async getPrecipitationByRange(startYear, endYear) {
    const promises = [];
    for (let y = startYear; y <= endYear; y++) {
      promises.push(this.getPrecipitationByYear(y));
    }
    const results = await Promise.all(promises);
    const allRecords = results.flatMap(r => r.records || []);
    return {
      records: allRecords,
      statistics: {
        totalStations: new Set(allRecords.map(r => r.stationName)).size,
        totalDaysCovered: new Set(allRecords.map(r => r.date)).size,
      },
    };
  },

  getAvailableYears() {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = 1988; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  },

  getLatestEmbassaments(records) {
    const latest = {};
    records.forEach(record => {
      if (!latest[record.name] || new Date(record.date) > new Date(latest[record.name].date)) {
        latest[record.name] = record;
      }
    });
    return Object.values(latest);
  },

  filterEmbassamentsByDateRange(records, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return records.filter(record => {
      const recordTime = new Date(record.date).setHours(12, 0, 0, 0);
      return recordTime >= start && recordTime <= end;
    });
  },

  filterPrecipitationByDateRange(records, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return records.filter(record => {
      const recordTime = new Date(record.date).setHours(12, 0, 0, 0);
      return recordTime >= start && recordTime <= end;
    });
  },

  getAvailableStations(precipitationData) {
    if (!precipitationData || !precipitationData.records) return [];
    const stations = [...new Set(precipitationData.records.map(r => normalizeStationName(r.stationName)))];
    return stations.sort();
  },

  getStatusColor(percentage) {
    if (percentage < 20) return '#FF4444';
    if (percentage < 50) return '#FFB700';
    if (percentage < 75) return '#44AA44';
    return '#1E7E1E';
  },
};

export default waterDataService;
