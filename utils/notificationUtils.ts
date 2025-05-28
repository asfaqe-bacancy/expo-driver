import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Alert } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  //@ts-ignore
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert("Error", "Failed to get notification permissions");
    return false;
  }
  return true;
}

// Trigger destination reached notification
export async function triggerDestinationReachedNotification() {
  console.log("Triggering call --- ");

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.error("Notification permissions not granted");
    return;
  }
  // Show notification immediately
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Destination Reached",
        body: "You have arrived at your destination!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: 'delivery-complete' },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error showing arrival notification:', error);
  }
}

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Handle notification response
  Notifications.addNotificationResponseReceivedListener(response => {
    if (response.notification.request.content.data?.screen === 'delivery-complete') {
      router.replace('/deliverycomplete');
    }
  });
}
