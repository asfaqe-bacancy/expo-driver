import { parseCoordinates } from "@/utils/mapUtils";
import {
  calculateDistance,
  triggerDestinationReachedNotification,
} from "@/utils/notificationUtils";
import * as Location from "expo-location";
import { useEffect } from "react";
import { Alert } from "react-native";

interface LocationUpdateOptions {
  showDirections: boolean;
  endCoordinates: string | null;
  onLocationUpdate: (coordinates: string) => void;
  onRegionUpdate?: (latitude: number, longitude: number) => void;
}

export const useLocationUpdates = ({
  showDirections,
  endCoordinates,
  onLocationUpdate,
  onRegionUpdate,
}: LocationUpdateOptions) => {
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationWatch = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permissions are required for navigation."
          );
          return null;
        }

        console.log("Starting location watch for navigation...");
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
            onRegionUpdate?.(latitude, longitude);

            console.log("Location update:", {
              coords: newCoords,
              accuracy,
              speed,
              timestamp: new Date(location.timestamp).toISOString(),
            });

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
        console.error("Error watching location:", error);
        return null;
      }
    };

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
        console.log("Navigation ended, location watch stopped");
      }
    };
  }, [showDirections, endCoordinates]);
};
