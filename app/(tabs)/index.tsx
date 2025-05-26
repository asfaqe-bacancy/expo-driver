import { ExternalNavigation } from "@/components/ExternalNavigation";
import { NavigationControls } from "@/components/NavigationControls";
import { NavigationMap } from "@/components/NavigationMap";
import { useAppState } from "@/hooks/useAppState";
import { useLocationUpdates } from "@/hooks/useLocationUpdates";
import { useMapRegion } from "@/hooks/useMapRegion";
import { useNavigationState } from "@/hooks/useNavigationState";
import { isValidCoordinates } from "@/utils/mapUtils";
import { useRef } from "react";
import { Alert, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const mapRef = useRef(null);

  const { region, updateRegionFromCoordinates } = useMapRegion();
  const { checkAndUpdateStartLocation } = useAppState();

  const {
    startCoordinates,
    setStartCoordinates,
    driverCoordinates,
    endCoordinates,
    setEndCoordinates,
    showDirections,
    setShowDirections,
    travelTime,
    setTravelTime,
  } = useNavigationState();

  useLocationUpdates({
    showDirections,
    onLocationUpdate: (newCoords) => {
      if (!startCoordinates) {
        updateRegionFromCoordinates(newCoords);
      }
    },
    onRegionUpdate: updateRegionFromCoordinates,
  });

  const handleStartNavigation = async () => {
    if (
      !isValidCoordinates(driverCoordinates) ||
      !isValidCoordinates(endCoordinates)
    ) {
      Alert.alert(
        "Invalid Coordinates",
        'Please enter valid coordinates in format "latitude,longitude" (e.g., "37.7749,-122.4194")'
      );
      return;
    }

    try {
      await ExternalNavigation.startNavigation(
        driverCoordinates,
        endCoordinates
      );
    } catch (error: any) {
      Alert.alert("Navigation Error", error?.message);
    }
  };
  // return null
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationMap
        ref={mapRef}
        region={region}
        startCoordinates={startCoordinates}
        endCoordinates={endCoordinates}
        showDirections={showDirections}
        onRouteReady={(result) => {
          const durationInMinutes = Math.round(result.duration);
          setTravelTime(`Estimated travel time: ${durationInMinutes} minutes`);
        }}
      />
      <NavigationControls
        startCoordinates={startCoordinates}
        setStartCoordinates={setStartCoordinates}
        driverCoordinates={driverCoordinates}
        endCoordinates={endCoordinates}
        setEndCoordinates={setEndCoordinates}
        showDirections={showDirections}
        setShowDirections={setShowDirections}
        travelTime={travelTime}
        onStartNavigation={handleStartNavigation}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
