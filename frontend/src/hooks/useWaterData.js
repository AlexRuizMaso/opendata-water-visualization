import { useState, useEffect } from 'react';
import waterDataService from '../services/waterDataService';

const getPrecipitationYears = (timeRange) => {
  const currentYear = new Date().getFullYear();
  switch (timeRange) {
    case '24hours':
    case '30days':
      return { startYear: currentYear, endYear: currentYear };
    case '1year':
      return { startYear: currentYear - 1, endYear: currentYear };
    case '2years':
      return { startYear: currentYear - 2, endYear: currentYear };
    case '5years':
      return { startYear: currentYear - 5, endYear: currentYear };
    default:
      return { startYear: currentYear, endYear: currentYear };
  }
};

export const useWaterData = (requirePrecipitation = false, timeRange = null) => {
  const [embassaments, setEmbassaments] = useState(null);
  const [precipitation, setPrecipitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const embassamentsPromise = waterDataService.getEmbassaments()
          .then(data => {
            if (active) setEmbassaments(data);
            return data;
          });

        let precipitationPromise = Promise.resolve(null);
        if (requirePrecipitation) {
          const { startYear, endYear } = getPrecipitationYears(timeRange);

          precipitationPromise = waterDataService.getPrecipitationByRange(startYear, endYear)
            .then(data => {
              if (active) setPrecipitation(data);
              return data;
            })
            .catch(err => {
              console.error('Error carregant precipitacions (no crític):', err);
              return null;
            });
        }

        await Promise.all([embassamentsPromise, precipitationPromise]);
      } catch (err) {
        console.error('Error loading water data:', err);
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [requirePrecipitation, timeRange]);

  return { embassaments, precipitation, loading, error };
};

export default useWaterData;
