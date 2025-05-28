import { Destination } from "@/constants/Destination";
import { Coordinates } from "@/constants/Interface";
import { GOOGLE_MAPS_API_KEY } from "@/constants/Keys";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

// Pure component for marker content to prevent re-renders
const MarkerContent = memo(
  ({ name, isSelected }: { name: string; isSelected: boolean }) => {
    // Format text once
    const markerText = name.length > 10 ? name.substring(0, 7) + ".." : name;

    return (
      <View
        style={[
          styles.markerContainer,
          isSelected && styles.selectedMarkerContainer,
        ]}
      >
        <Text style={styles.markerText}>{markerText}</Text>
      </View>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected && prev.name === next.name
);

interface NavigationMapProps {
  region: Region;
  startCoordinates: Coordinates | null;
  endCoordinates: Coordinates | null;
  destinations: Destination[];
  showDirections: boolean;
  onMarkerPress: (destination: Destination) => void;
  onRouteReady: (result: { distance: number; duration: number }) => void;
  routeDetails: {
    distance: number;
    duration: number;
  } | null;
}

export const NavigationMap = ({
  region,
  startCoordinates,
  endCoordinates,
  destinations,
  showDirections,
  onMarkerPress,
  onRouteReady,
  routeDetails,
}: NavigationMapProps) => {
  // Store the active destination ID rather than using deep equality checks
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Update selected ID when endCoordinates changes
  useEffect(() => {
    if (!endCoordinates) {
      setSelectedId(null);
      return;
    }

    // Find the destination that matches the end coordinates
    const destination = destinations.find(
      (d) =>
        d.coordinates.lat === endCoordinates.lat &&
        d.coordinates.lng === endCoordinates.lng
    );

    setSelectedId(destination?.id || null);
  }, [endCoordinates?.lat, endCoordinates?.lng]);

  const MarkerMemo = useMemo(() => {
    return destinations.map((destination: Destination) => {
      return (
        <Marker
          key={destination.id}
          coordinate={{
            latitude: destination.coordinates.lat,
            longitude: destination.coordinates.lng,
          }}
          title={destination.name}
          onPress={() => onMarkerPress(destination)}
          tracksViewChanges={false}
          tracksInfoWindowChanges={false}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <MarkerContent
            name={destination.name}
            isSelected={destination.id === selectedId}
          />
        </Marker>
      );
    });
  }, []);
  const mapRef = useRef(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        region={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={!showDirections}
        moveOnMarkerPress={false}
        // onLayout={() => {
        //   // Ensure the map is centered on the region when it first loads
        //   console.log("Map layout complete, centering on region:", region);
        // }}
        // onMapLoaded={() => {
        //   // Log when the map is fully loaded
        //   console.log("Map has been loaded");
        // }}
        // onMapReady={() => {
        //   // Log when the map is ready
        //   console.log("Map is ready");
        // }}
        // onUserLocationChange={(event) => {
        //   // Log user location changes
        //   console.log("User location changed:", event.nativeEvent.coordinate);
        // }}
      >
        {MarkerMemo}
        {/* Route directions if a destination is selected and directions are shown */}
        {showDirections && startCoordinates && endCoordinates && (
          <MapViewDirections
            origin={{
              latitude: startCoordinates.lat,
              longitude: startCoordinates.lng,
            }}
            destination={{
              latitude: endCoordinates.lat,
              longitude: endCoordinates.lng,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="#007AFF"
            onReady={onRouteReady}
            resetOnChange={false}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    backgroundColor: "blue",
    padding: 5,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  selectedMarkerContainer: {
    backgroundColor: "red",
  },
  markerText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
});
