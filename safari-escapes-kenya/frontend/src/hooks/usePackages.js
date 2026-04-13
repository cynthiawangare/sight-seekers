import { useState, useEffect } from 'react';
import { getPackages } from '../services/packageService';

export function usePackages(filters = {}) {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getPackages(filters)
      .then((data) => {
        if (!cancelled) {
          setPackages(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [filters.tourType, filters.country]);

  return { packages, isLoading, error };
}
