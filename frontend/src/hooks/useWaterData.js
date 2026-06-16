import { useState, useEffect } from 'react';
import waterDataService from '../services/waterDataService';

export const useWaterData = (requirePrecipitation = false) => {
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
          precipitationPromise = waterDataService.getPrecipitation()
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
  }, [requirePrecipitation]);

  return { embassaments, precipitation, loading, error };
};

export default useWaterData;
