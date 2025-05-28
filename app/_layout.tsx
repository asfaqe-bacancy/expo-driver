import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { usePersistedNavigation } from "@/hooks/usePersistedNavigation";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { usePermissions } from "@/hooks/usePermissioon";


export default function RootLayout() {
  // const colorScheme = useColorScheme();
  // const [loaded] = useFonts({
  //   SpaceMono: reqxuire("../assets/fonts/SpaceMono-Regular.ttf"),
  // });

  // if (!loaded)r {
  //   // Async font loading only occurs in development.
  //   return null;
  // }

  const { activeNavigation } = usePersistedNavigation();

  // Prevent navigation actions while a delivery is active
  // useEffect(() => {
  //   if (activeNavigation) {
  //     // If using react-navigation, you can add navigation listeners here
  //     // to prevent leaving the current screen

  //     const preventNavigation = () => {
  //       Alert.alert(
  //         "Active Navigation",
  //         "You can't leave this screen while a delivery is active."
  //       );
  //       return true;
  //     };

  //     // Example with React Navigation
  //     // navigation.addListener('beforeRemove', (e) => {
  //     //   e.preventDefault();
  //     //   preventNavigation();
  //     // });
  //   }
  // }, [activeNavigation]);

  // useEffect(() => {
  //   const initializeApp = async () => {
  //     try {
  //       // Run operations in parallel
  //       const [permissionStatus, locationInit] = await Promise.all([
  //         checkPermissions(),
  //         Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
  //         // loadNavigationState() // Your navigation state loading function
  //       ]);

  //       console.log("App initialization complete");
  //     } catch (error) {
  //       console.error("Error during app initialization:", error);
  //     }
  //   };

  //   initializeApp();
  // }, []);

  const { isChecking, hasPermissions } = usePermissions();

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Checking permissions...</Text>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Please grant required permissions to use the app.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="deliverycomplete" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
