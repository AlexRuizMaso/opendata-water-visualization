import { useState, useEffect } from 'react';
import waterDataService from '../services/waterDataService';

/**
 * Custom Hook: useWaterData
 * Fetches and manages water data with caching
 */
export const useWaterData = () => {
  const [embassaments, setEmbassaments] = useState(null);
  const [precipitation, setPrecipitation] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [embData, precData, metaData] = await Promise.all([
          waterDataService.getEmbassaments(),
          waterDataService.getPrecipitation(),
          waterDataService.getMetadata(),
        ]);

        setEmbassaments(embData);
        setPrecipitation(precData);
        setMetadata(metaData);
      } catch (err) {
        console.error('Error loading water data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { embassaments, precipitation, metadata, loading, error };
};

/**
 * Custom Hook: useEmbassamentTimeSeries
 * Get time series data for a specific embassament
 */
export const useEmbassamentTimeSeries = (embassamentName, dateRange = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { embassaments } = useWaterData();

  useEffect(() => {
    if (!embassaments?.records) return;

    let filtered = embassaments.records.filter(r => r.name === embassamentName);

    if (dateRange?.start && dateRange?.end) {
      filtered = waterDataService.filterEmbassamentsByDateRange(
        filtered,
        dateRange.start,
        dateRange.end
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(filtered);
    setLoading(false);
  }, [embassaments, embassamentName, dateRange]);

  return { data, loading };
};

/**
 * Custom Hook: usePrecipitationTimeSeries
 * Get precipitation time series for a specific station
 */
export const usePrecipitationTimeSeries = (stationName, dateRange = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { precipitation } = useWaterData();

  useEffect(() => {
    if (!precipitation?.records) return;

    let filtered = waterDataService.filterPrecipitationByStation(
      precipitation.records,
      stationName
    );

    if (dateRange?.start && dateRange?.end) {
      filtered = waterDataService.filterPrecipitationByDateRange(
        filtered,
        dateRange.start,
        dateRange.end
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(filtered);
    setLoading(false);
  }, [precipitation, stationName, dateRange]);

  return { data, loading };
};

export default useWaterData;
