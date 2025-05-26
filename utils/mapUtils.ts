import { Alert } from "react-native";

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const DEFAULT_REGION: MapRegion = {
  latitude: 23.0513498,
  longitude: 72.4917073,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const parseCoordinates = (coordinates: string): [number, number] => {
  if (!isValidCoordinates(coordinates)) {
    throw new Error("Invalid coordinates format");
  }
  const [lat, lng] = coordinates.split(",");
  return [parseFloat(lat.trim()), parseFloat(lng.trim())];
};

export const isValidCoordinates = (coordinates: string): boolean => {
  if (!coordinates || typeof coordinates !== "string") {
    return false;
  }

  const parts = coordinates.split(",");
  if (parts.length !== 2) {
    return false;
  }

  const [lat, lng] = parts;
  const latitude = parseFloat(lat.trim());
  const longitude = parseFloat(lng.trim());

  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }

  // Check if coordinates are within valid ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};

export const handleLocationError = (error: any) => {
  console.error("Location error:", error);
  Alert.alert(
    "Location Error",
    "Failed to get current location. Please check your location settings."
  );
};
