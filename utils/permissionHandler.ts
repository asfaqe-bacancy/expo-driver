import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Alert, Linking, Platform } from 'react-native';


const PERMISSION_CHECK_KEY = 'permission_check_timestamp';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours


interface PermissionStatus {
  location: boolean;
  background: boolean;
  notification: boolean;
}

export const checkPermissions = async (): Promise<PermissionStatus> => {
  console.log('Checking permissions...');
  
  const locationForeground = await Location.getForegroundPermissionsAsync();
  const locationBackground = await Location.getBackgroundPermissionsAsync();
  const notifications = await Notifications.getPermissionsAsync();

  console.log('Permission status:', {
    foreground: locationForeground.status,
    background: locationBackground.status,
    notifications: notifications.status
  });

  return {
    location: locationForeground.status === 'granted',
    background: locationBackground.status === 'granted',
    notification: notifications.status === 'granted'
  };
};

export const shouldCheckPermissions = async (): Promise<boolean> => {
  const lastCheck = await SecureStore.getItemAsync(PERMISSION_CHECK_KEY);

  if (!lastCheck) return true;

  const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
  return timeSinceLastCheck > CHECK_INTERVAL;
};

export const requestPermissions = async (): Promise<boolean> => {
  console.log('Requesting permissions...');
  try {
    // Check if we need to request permissions based on last check
    const shouldCheck = await shouldCheckPermissions();
    if (!shouldCheck) {
      const currentStatus = await checkPermissions();
      if (currentStatus.location && currentStatus.background && currentStatus.notification) {
        return true;
      }
    }

    // Request foreground location
    const { status: foregroundStatus } = 
      await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to function properly.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
      return false;
    }

    // Handle Android background location
    if (Platform.OS === 'android') {
      const { status: backgroundStatus } = 
        await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location Required',
          'Please allow location access "All the time" in settings to track deliveries.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              }
            }
          ]
        );
        return false;
      }
    }

    // Request notification permissions with proper iOS options
    const { status: notificationStatus } = 
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true, // Important for delivery notifications
        },
      });

    if (notificationStatus !== 'granted') {
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications to receive delivery updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
      return false;
    }

    // Save successful permission check timestamp
    await SecureStore.setItemAsync(PERMISSION_CHECK_KEY, Date.now().toString());
    console.log('All permissions granted successfully');
    return true;

  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};