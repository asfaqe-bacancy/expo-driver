import { ExternalNavigation } from "@/components/ExternalNavigation";
import { NavigationControls } from "@/components/NavigationControls";
import { NavigationMap } from "@/components/NavigationMap";
import { Destination, DESTINATIONS } from "@/constants/Destination";
import { Coordinates } from "@/constants/Interface";
import { useInitialLocation } from "@/hooks/useInitialLocation";
import { useLocationUpdates } from "@/hooks/useLocationUpdates";
import { useMapRegion } from "@/hooks/useMapRegion";
import { useNavigationState } from "@/hooks/useNavigationState";
import { usePersistedNavigation } from "@/hooks/usePersistedNavigation";
// import { useRouteUpdate } from "@/hooks/useRouteState";

import { isValidCoordinates } from "@/utils/mapUtils";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  const [routeDetails, setRouteDetails] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const handleRouteUpdate = useCallback(() => {
    // Force route recalculation
    setRouteDetails(null);
  }, []);

  const { region, updateRegionFromCoordinates } = useMapRegion();
  const { location, isLoading: initialLoading, error } = useInitialLocation();

  // const { checkAndUpdateStartLocation } = useRouteUpdate();

  const {
    startCoordinates,
    driverCoordinates,
    updateDriverLocation,
    setEndCoordinates,
    endCoordinates,
    showDirections,
    setShowDirections,
    travelTime,
    setTravelTime,
  } = useNavigationState();

  // const checkShouldUpdateRoute = useRouteUpdate(
  //   showDirections,
  //   handleRouteUpdate
  // );
  // Persisted navigation state
  const {
    isLoading,
    activeNavigation,
    currentDestination,
    navigationStartTime,
    startNavigation,
    endNavigation,
  } = usePersistedNavigation();

  // When persisted navigation is loaded, use it
  useEffect(() => {
    if (!isLoading && currentDestination) {
      setSelectedDestination(currentDestination);
      setEndCoordinates(currentDestination.coordinates);
      setShowDirections(true);
    }
  }, [isLoading, currentDestination]);

  useEffect(() => {
    if (location && !driverCoordinates) {
      console.log("Setting initial driver location:", location);
      updateDriverLocation(location);
      // Also update the region to center on driver's location
      updateRegionFromCoordinates(location.lat, location.lng);
    }
  }, [location, updateDriverLocation]);

  // Add this debug log to track driverCoordinates updates
  useEffect(() => {
    console.log("Driver coordinates updated:", driverCoordinates);
  }, [driverCoordinates]);

  // Set up location updates
  useLocationUpdates({
    showDirections,
    endCoordinates,
    onLocationUpdate: (location: Coordinates) => {
      console.log("Current location updated:", location);
      updateDriverLocation(location);

      if (!showDirections) {
        updateRegionFromCoordinates(location.lat, location.lng);
      }
    },
    onRegionUpdate: (lat, lng) => updateRegionFromCoordinates(lat, lng),
  });

  const handleMarkerPress = (destination: Destination) => {
    if (activeNavigation) {
      Alert.alert(
        "Navigation Active",
        "You're currently navigating to a destination. Complete your delivery first."
      );
      return;
    }

    setSelectedDestination(destination);
    setEndCoordinates(destination.coordinates);
    // Don't show directions yet, just select the destination
  };

  const handleShowRoute = () => {
    if (!selectedDestination) return;
    setShowDirections(true);
  };

  const handleStartNavigation = async () => {
    if (!isValidCoordinates(driverCoordinates) || !selectedDestination) {
      Alert.alert(
        "Location Error",
        "Unable to get your current location or destination. Please try again."
      );
      return;
    }

    try {
      // First start the persisted navigation state
      await startNavigation(selectedDestination, driverCoordinates);

      // Then launch external navigation
      await ExternalNavigation.startNavigation(
        driverCoordinates,
        selectedDestination.coordinates
      );
    } catch (error: any) {
      Alert.alert("Navigation Error", error?.message);
    }
  };

  const handleCompleteDelivery = async () => {
    const confirmed = await endNavigation();
    if (confirmed) {
      // Reset UI state
      clearDirections();
    }
  };

  const clearDirections = () => {
    if (activeNavigation) {
      Alert.alert(
        "Navigation Active",
        "You can't clear directions while navigation is active."
      );
      return;
    }

    setShowDirections(false);
    setTravelTime("");
  };

  // Show loading screen while checking for persisted navigation
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // useEffect(() => {
  //   if (error) {
  //     Alert.alert(
  //       "Location Error",
  //       "Unable to get your location. Please check your location settings.",
  //       [
  //         {
  //           text: "Open Settings",
  //           onPress: () => Linking.openSettings(),
  //         },
  //         { text: "OK" },
  //       ]
  //     );
  //   }
  // }, [error]);

  // Show loading state
  if (initialLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationMap
        region={region}
        startCoordinates={driverCoordinates}
        endCoordinates={selectedDestination?.coordinates}
        destinations={DESTINATIONS}
        onMarkerPress={handleMarkerPress}
        showDirections={showDirections}
        routeDetails={routeDetails}
        // onRouteReady={(result) => {
        //   if (checkShouldUpdateRoute()) {
        //     setRouteDetails(result);
        //     const durationInMinutes = Math.round(result.duration);
        //     setTravelTime(
        //       `Estimated travel time: ${durationInMinutes} minutes`
        //     );
        //   }
        // }}
      />

      <NavigationControls
        driverCoordinates={driverCoordinates}
        destinations={DESTINATIONS}
        selectedDestination={selectedDestination}
        onDestinationSelect={handleMarkerPress}
        showDirections={showDirections}
        setShowDirections={setShowDirections}
        travelTime={travelTime}
        onStartNavigation={handleStartNavigation}
        activeNavigation={activeNavigation}
        onCompleteDelivery={handleCompleteDelivery}
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
  destinationsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  destinationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  destinationsList: {
    maxHeight: 200,
  },
  destinationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedDestination: {
    backgroundColor: "#f0f8ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  destinationAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  showRouteButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  showRouteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
