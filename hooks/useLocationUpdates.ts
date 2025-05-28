import { useEffect } from "react";
import * as Location from "expo-location";
import { startBackgroundLocationUpdates, stopBackgroundLocationUpdates } from '@/utils/BackgroundLocationService';
import { Coordinates } from "@/constants/Interface";

export const useLocationUpdates = ({
  showDirections,
  endCoordinates,
  onLocationUpdate,
  onRegionUpdate,
}: any) => {
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        if (showDirections && endCoordinates) {
          // Start background tracking
          await startBackgroundLocationUpdates(endCoordinates);
        }

        // Start foreground tracking
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            const currentCoords: Coordinates = { lat: latitude, lng: longitude };
            onLocationUpdate(currentCoords);
          }
        );
      } catch (error) {
        console.error("Error setting up location tracking:", error);
      }
    };

    if (showDirections) {
      startTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
        stopBackgroundLocationUpdates().catch(console.error);
      }
    };
  }, [showDirections, endCoordinates]);
};