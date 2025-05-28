import { Coordinates } from "@/types";
import { Linking, Platform } from "react-native";

export const ExternalNavigation = {
  startNavigation: async (startCoordinates: Coordinates | null, endCoordinates: Coordinates | null) => {
    if (!startCoordinates || !endCoordinates) {
      throw new Error("Invalid coordinates provided");
    }

    const { lat: startLat, lng: startLng } = startCoordinates;
    const { lat: endLat, lng: endLng } = endCoordinates;

    try {
      const url = Platform.select({
        ios: `https://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&dirflg=d`,
        android: `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=driving`,
      });

      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error("Unable to open maps application");
        }
      }
    } catch (error) {
      console.error("Error launching navigation:", error);
      throw new Error("Failed to start navigation");
    }
  },
};