import { ThemedText } from "@/components/ThemedText";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface NavigationControlsProps {
  startCoordinates: string;
  setStartCoordinates: (text: string) => void;
  driverCoordinates: string;
  endCoordinates: string;
  setEndCoordinates: (text: string) => void;
  showDirections: boolean;
  setShowDirections: (show: boolean) => void;
  travelTime: string;
  onStartNavigation: () => void;
}

export function NavigationControls({
  startCoordinates,
  setStartCoordinates,
  driverCoordinates,
  endCoordinates,
  setEndCoordinates,
  showDirections,
  setShowDirections,
  travelTime,
  onStartNavigation,
}: NavigationControlsProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={startCoordinates}
        onChangeText={(text) => {
          setStartCoordinates(text);
          setShowDirections(false);
        }}
        placeholder="Enter start coordinates (lat,lng)"
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={styles.setLocationButton}
        onPress={() => {
          setStartCoordinates(driverCoordinates);
          setShowDirections(false);
        }}
      >
        <ThemedText style={styles.buttonText}>
          Use Current Location as Start
        </ThemedText>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={endCoordinates}
        onChangeText={(text) => {
          setEndCoordinates(text);
          setShowDirections(false);
        }}
        placeholder="Enter end coordinates (lat,lng)"
        placeholderTextColor="#999"
      />
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={() => {
            if (!startCoordinates || !endCoordinates) {
              Alert.alert(
                "Missing Coordinates",
                "Please set both start and end coordinates"
              );
              return;
            }
            setShowDirections(true);
          }}
        >
          <ThemedText style={styles.buttonText}>Show Route</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={onStartNavigation}
        >
          <ThemedText style={styles.buttonText}>Start Navigation</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.locationText}>
        Driver's Location: {driverCoordinates || "Fetching location..."}
      </ThemedText>
      {showDirections && travelTime && (
        <ThemedText style={[styles.locationText, { color: "#2196F3" }]}>
          {travelTime}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  setLocationButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  locationText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});
