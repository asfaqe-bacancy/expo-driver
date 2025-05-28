
import { Destination } from "@/constants/Destination";
import { Coordinates } from "@/constants/Interface";
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NavigationControlsProps {
  driverCoordinates: Coordinates | null;
  destinations: Destination[];
  selectedDestination: Destination | null;
  onDestinationSelect: (destination: Destination) => void;
  showDirections: boolean;
  setShowDirections: (show: boolean) => void;
  travelTime: string;
  onStartNavigation: () => void;
  activeNavigation: boolean;
  onCompleteDelivery?: () => void;
}

export const NavigationControls = ({
  driverCoordinates,
  destinations,
  selectedDestination,
  onDestinationSelect,
  showDirections,
  setShowDirections,
  travelTime,
  onStartNavigation,
  activeNavigation,
  onCompleteDelivery,
}: NavigationControlsProps) => {
  const handleShowRoute = () => {
    if (!driverCoordinates) {
      Alert.alert(
        "Location Unavailable",
        "Unable to get your current location. Please check your location settings and try again.",
        [
          { 
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          },
          { text: "OK" }
        ]
      );
      return;
    }
    setShowDirections(true);
  };

  const handleGoBack = () => {
    if (activeNavigation) {
      alert("Cannot go back while navigation is active");
      return;
    }
    setShowDirections(false);
  };

  return (
    <View style={styles.bottomSheet}>
      {!showDirections ? (
        // Destination selection view
        <View>
          <Text style={styles.sheetTitle}>Select Destination</Text>
          <FlatList
            data={destinations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.destinationItem,
                  selectedDestination?.id === item.id && styles.selectedDestination,
                  activeNavigation && styles.disabledItem // Disable selection during active navigation
                ]}
                onPress={() => {
                  if (activeNavigation) {
                    alert("Cannot change destination during active navigation");
                    return;
                  }
                  onDestinationSelect(item);
                }}
                disabled={activeNavigation} // Disable selection
              >
                <Text style={styles.destinationName}>{item.name}</Text>
                <Text style={styles.destinationAddress}>{item.address}</Text>
              </TouchableOpacity>
            )}
            style={styles.destinationsList}
          />
          {selectedDestination && !activeNavigation && (
            <TouchableOpacity
              style={styles.showRouteButton}
              onPress={handleShowRoute}
            >
              <Text style={styles.buttonText}>
                Show Route to {selectedDestination.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        // Directions and navigation view
        <View>
          <View style={styles.navigationHeader}>
            <Text style={styles.destinationTitle}>
              {selectedDestination?.name}
            </Text>
            <Text style={styles.destinationAddress}>
              {selectedDestination?.address}
            </Text>
          </View>
          
          <View style={styles.routeContainer}>
            <Text style={styles.travelTimeText}>{travelTime}</Text>
            
            {!activeNavigation && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleGoBack}
              >
                <Text style={styles.backButtonText}>Back to destinations</Text>
              </TouchableOpacity>
            )}
            
            {activeNavigation ? (
              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={onCompleteDelivery}
              >
                <Text style={styles.buttonText}>Complete Delivery</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.navigationButton} 
                onPress={onStartNavigation}
              >
                <Text style={styles.buttonText}>Start Navigation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingTop: 16,
    maxHeight: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  destinationsList: {
    maxHeight: 200,
  },
  destinationItem: {
    padding: 14,
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
    color: "#333",
  },
  destinationAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  showRouteButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  navigationButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  routeContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  navigationHeader: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  destinationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  travelTimeText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "500",
    color: "#333",
  },
  backButton: {
    padding: 12,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledItem: {
    opacity: 0.5,
  },
  completeButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    width: "100%",
  },
});