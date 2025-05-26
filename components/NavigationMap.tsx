import { GOOGLE_MAPS_API_KEY } from "@/constants/Keys";
import { parseCoordinates } from "@/utils/mapUtils";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

interface NavigationMapProps {
  startCoordinates: string;
  driverCoordinates: string;
  endCoordinates: string;
  showDirections: boolean;
  onTravelTimeUpdate: (time: string) => void;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  startCoordinates,
  driverCoordinates,
  endCoordinates,
  showDirections,
  onTravelTimeUpdate,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (
      showDirections &&
      mapRef.current &&
      startCoordinates &&
      endCoordinates
    ) {
      const [startLat, startLng] = parseCoordinates(startCoordinates);
      const [endLat, endLng] = parseCoordinates(endCoordinates);

      mapRef.current.fitToCoordinates(
        [
          { latitude: startLat, longitude: startLng },
          { latitude: endLat, longitude: endLng },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [showDirections, startCoordinates, endCoordinates]);

  const renderMarkers = () => {
    const markers = [];

    if (driverCoordinates) {
      const [driverLat, driverLng] = parseCoordinates(driverCoordinates);
      markers.push(
        <Marker
          key="driver"
          coordinate={{ latitude: driverLat, longitude: driverLng }}
          title="Driver Location"
        />
      );
    }

    if (endCoordinates) {
      const [endLat, endLng] = parseCoordinates(endCoordinates);
      markers.push(
        <Marker
          key="destination"
          coordinate={{ latitude: endLat, longitude: endLng }}
          title="Destination"
        />
      );
    }

    return markers;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        followsUserLocation
      >
        {renderMarkers()}
        {showDirections && startCoordinates && endCoordinates && (
          <MapViewDirections
            origin={startCoordinates}
            destination={endCoordinates}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={3}
            strokeColor="#2196F3"
            onReady={(result) => {
              onTravelTimeUpdate(Math.ceil(result.duration) + " min");
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
