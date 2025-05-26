import { handleLocationError, parseCoordinates } from "@/utils/mapUtils";
import {
  calculateDistance,
  triggerDestinationReachedNotification,
} from "@/utils/notificationUtils";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface LocationTrackingOptions {
  showDirections: boolean;
  endCoordinates: string | null;
  onLocationUpdate: (coords: string) => void;
  onStartLocationUpdate?: (coords: string) => void;
}

export const useLocationTracking = ({
  showDirections,
  endCoordinates,
  onLocationUpdate,
  onStartLocationUpdate,
}: LocationTrackingOptions) => {
  const [isTracking, setIsTracking] = useState(false);

  const startLocationWatch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        handleLocationError(new Error("Location permission denied"));
        return null;
      }

      console.log("Starting location watch for navigation...");
      setIsTracking(true);

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (location) => {
          const { latitude, longitude, accuracy, speed } = location.coords;
          const newCoords = `${latitude},${longitude}`;

          onLocationUpdate(newCoords);

          console.log("Location update:", {
            coords: newCoords,
            accuracy,
            speed,
            timestamp: new Date(location.timestamp).toISOString(),
          });

          if (showDirections) {
            onStartLocationUpdate?.(newCoords);
          }

          // Check if driver has reached destination
          if (endCoordinates) {
            const [destLat, destLng] = parseCoordinates(endCoordinates);
            const distance = calculateDistance(
              latitude,
              longitude,
              destLat,
              destLng
            );

            console.log("Distance to destination:", distance, "meters");

            if (distance < 30) {
              await triggerDestinationReachedNotification();
            }
          }
        }
      );
    } catch (error) {
      handleLocationError(error);
      setIsTracking(false);
      return null;
    }
  };

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (showDirections) {
      startLocationWatch().then((subscription) => {
        if (subscription) {
          locationSubscription = subscription;
        }
      });
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
        setIsTracking(false);
        console.log("Navigation ended, location watch stopped");
      }
    };
  }, [showDirections]);

  return { isTracking };
};
