import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '@/constants/Interface';

export const useInitialLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission not granted');
          setIsLoading(false);
          return;
        }

        // Enable high accuracy and set a timeout
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000
        });

        if (mounted) {
          setLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to get location');
          setIsLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, isLoading, error };
};