import { Coordinates } from "@/constants/Interface";
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

// export const isValidCoordinates = (coordinates: string): boolean => {
//   if (!coordinates || typeof coordinates !== "string") {
//     return false;
//   }

//   const parts = coordinates.split(",");
//   if (parts.length !== 2) {
//     return false;
//   }

//   const [lat, lng] = parts;
//   const latitude = parseFloat(lat.trim());
//   const longitude = parseFloat(lng.trim());

//   if (isNaN(latitude) || isNaN(longitude)) {
//     return false;
//   }

//   // Check if coordinates are within valid ranges
//   if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
//     return false;
//   }

//   return true;
// };

export const handleLocationError = (error: any) => {
  console.error("Location error:", error);
  Alert.alert(
    "Location Error",
    "Failed to get current location. Please check your location settings."
  );
};


export const stringToCoordinates = (coordsString: string): Coordinates | null => {
  if (!coordsString || typeof coordsString !== 'string') return null;
  
  const [latStr, lngStr] = coordsString.split(',');
  if (!latStr || !lngStr) return null;
  
  const lat = parseFloat(latStr.trim());
  const lng = parseFloat(lngStr.trim());
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
};

export const coordinatesToString = (coords: Coordinates | null): string => {
  if (!coords) return '';
  return `${coords.lat},${coords.lng}`;
};

export const isValidCoordinates = (coords: Coordinates | null): boolean => {
  if (!coords) return false;
  return !isNaN(coords.lat) && !isNaN(coords.lng);
};

// export const calculateDistance = (
//   lat1: number, 
//   lng1: number, 
//   lat2: number, 
//   lng2: number
// ): number => {
//   // Haversine formula to calculate distance between two points



//   const R = 6371; // Radius of the earth in km
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLng = (lng2 - lng1) * Math.PI / 180;
//   const a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//     Math.sin(dLng/2) * Math.sin(dLng/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c; // Distance in km
// };

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  // Radius of the Earth in kilometers
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 1000; // Convert to meters
};