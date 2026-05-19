import { useState, useEffect } from 'react';
import waterDataService from '../services/waterDataService';

/**
 * Custom Hook: useWaterData
 * Fetches and manages water data with caching
 */
export const useWaterData = (requirePrecipitation = false) => {
  const [embassaments, setEmbassaments] = useState(null);
  const [precipitation, setPrecipitation] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const timing = {};

        // Iniciar descàrrega dels embassaments (sempre requerits)
        const embStart = Date.now();
        const embassamentsPromise = waterDataService.getEmbassaments()
          .then(data => {
            timing.embassaments = Date.now() - embStart;
            if (active) setEmbassaments(data);
            return data;
          });

        // Iniciar descàrrega de metadades (sempre requerides)
        const metaStart = Date.now();
        const metadataPromise = waterDataService.getMetadata()
          .then(data => {
            timing.metadata = Date.now() - metaStart;
            if (active) setMetadata(data);
            return data;
          });

        // Iniciar descàrrega de precipitacions només si es demana explícitament (Pas 2)
        let precipitationPromise = Promise.resolve(null);
        if (requirePrecipitation) {
          const precStart = Date.now();
          precipitationPromise = waterDataService.getPrecipitation()
            .then(data => {
              timing.precipitation = Date.now() - precStart;
              if (active) setPrecipitation(data);
              return data;
            })
            .catch(err => {
              console.error('Error carregant precipitacions (no crític per a altres vistes):', err);
              // Si falla la precipitació, no hauria de fer caure tot el panell si tenim embassaments
              return null;
            });
        }

        // Esperar que es resolguin en paral·lel
        await Promise.all([embassamentsPromise, metadataPromise, precipitationPromise]);

        if (active) {
          console.log('⏱️ Temps de descàrrega de dades:');
          console.table(timing);
        }
      } catch (err) {
        console.error('Error loading crucial water data:', err);
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [requirePrecipitation]);

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

    // Sort by date ascending (oldest first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  const { precipitation } = useWaterData(true);

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

    // Sort by date ascending (oldest first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setData(filtered);
    setLoading(false);
  }, [precipitation, stationName, dateRange]);

  return { data, loading };
};

export default useWaterData;
