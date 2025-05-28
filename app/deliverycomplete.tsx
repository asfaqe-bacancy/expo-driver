import { useNavigationState } from "@/hooks/useNavigationState";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DeliveryCompleteScreen() {
  const router = useRouter();
  const { resetNavigationState } = useNavigationState();

  const handleBackToHome = () => {
    resetNavigationState();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Complete!</Text>
      <Text style={styles.subtitle}>
        Thank you for completing the delivery.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleBackToHome}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
