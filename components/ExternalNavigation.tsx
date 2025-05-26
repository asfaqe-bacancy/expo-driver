import { parseCoordinates } from "@/utils/mapUtils";
import { Alert, Linking, Platform } from "react-native";

interface ExternalNavigationProps {
  startCoordinates: string;
  endCoordinates: string;
}

export const ExternalNavigation = {
  openGoogleMaps: async (start: string, end: string) => {
    const [startLat, startLng] = parseCoordinates(start);
    const [endLat, endLng] = parseCoordinates(end);

    // Construct Google Maps URL for navigation
    const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=driving`;

    console.log("Opening Google Maps URL:", url);
    await Linking.openURL(url);
  },

  openAppleMaps: async (start: string, end: string) => {
    const [startLat, startLng] = parseCoordinates(start);
    const [endLat, endLng] = parseCoordinates(end);

    // Construct Apple Maps URL for navigation
    const url = `http://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&dirflg=d`;

    console.log("Opening Apple Maps URL:", url);
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error("Cannot open Apple Maps.");
    }

    await Linking.openURL(url);
  },

  startNavigation: async ({
    startCoordinates,
    endCoordinates,
  }: ExternalNavigationProps) => {
    try {
      if (Platform.OS === "ios") {
        await ExternalNavigation.openAppleMaps(
          startCoordinates,
          endCoordinates
        );
      } else {
        await ExternalNavigation.openGoogleMaps(
          startCoordinates,
          endCoordinates
        );
      }
    } catch (error: any) {
      Alert.alert("Navigation Error", error?.message);
    }
  },
};
