import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import { calculateDistance } from './mapUtils';
import { triggerDestinationReachedNotification } from './notificationUtils';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const ARRIVAL_THRESHOLD = 50; // meters

// Store destination coordinates for background task
let destinationCoords: { lat: number; lng: number } | null = null;
let isTaskRegistered = false;

// Define the background task
// if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
//   TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
//     if (error) {
//       console.error('Background location task error:', error);
//       return;
//     }
    
//     if (data) {
//       // ...existing task code...
//     }
//   });
  
// }

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data && destinationCoords) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    console.log('Location Update:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(location.timestamp).toISOString()
    });

    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      destinationCoords.lat,
      destinationCoords.lng
    );

    console.log('Distance to destination:', distance, 'meters');

    if (distance <= ARRIVAL_THRESHOLD) {
      await triggerDestinationReachedNotification();
      router.replace('/deliverycomplete');
      await stopBackgroundLocationUpdates();
    }
  }
  isTaskRegistered = true;
});

export const startBackgroundLocationUpdates = async (endCoords: { lat: number; lng: number }) => {
  try {
    destinationCoords = endCoords;

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );
    
    if (hasStarted) {
      console.log('Background location task already running');
      return;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000, // Check every 5 seconds
      distanceInterval: 10, // or every 10 meters
      foregroundService: {
        notificationTitle: "Navigation Active",
        notificationBody: "Tracking your location",
        notificationColor: "#007AFF",
        notificationImportance: 3
      },
      showsBackgroundLocationIndicator: true,
      activityType: Location.ActivityType.AutomotiveNavigation,
      pausesUpdatesAutomatically: false
    });

    console.log('Background location tracking started');
  } catch (error) {
    console.error('Error starting background location:', error);
    throw error;
  }
};

export const stopBackgroundLocationUpdates = async () => {
  try {
    // Check if task is registered first
    if (!isTaskRegistered) {
      console.log('Task not registered, no need to stop');
      return;
    }

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    ).catch(() => false);
    
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('Background location tracking stopped successfully');
    } else {
      console.log('No background location tracking to stop');
    }
  } catch (error) {
    console.error('Failed to stop background location tracking:', error);
    // Don't throw the error, just log it
  }
};