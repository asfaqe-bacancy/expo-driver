import * as SecureStore from 'expo-secure-store';

// Define the shape of the navigation state we want to persist
export interface PersistedNavigationState {
  isNavigationActive: boolean;
  destinationId: string | null;
  destinationName: string | null;
  destinationCoordinates: {
    lat: number;
    lng: number;
  } | null;
  startTime: number | null;
  driverCoordinates: {
    lat: number;
    lng: number;
  } | null;
}

// Key for storing in SecureStore
const NAVIGATION_STATE_KEY = 'driver_navigation_state';

// Default/empty state
const defaultState: PersistedNavigationState = {
  isNavigationActive: false,
  destinationId: null,
  destinationName: null,
  destinationCoordinates: null,
  startTime: null,
  driverCoordinates: null,
};

// Save navigation state to storage
export const saveNavigationState = async (state: PersistedNavigationState): Promise<void> => {
  try {
    await SecureStore.setItemAsync(NAVIGATION_STATE_KEY, JSON.stringify(state));
    console.log('Navigation state saved successfully');
  } catch (error) {
    console.error('Error saving navigation state:', error);
  }
};

// Get navigation state from storage
export const getNavigationState = async (): Promise<PersistedNavigationState> => {
  try {
    const storedState = await SecureStore.getItemAsync(NAVIGATION_STATE_KEY);
    if (!storedState) return defaultState;
    
    return JSON.parse(storedState) as PersistedNavigationState;
  } catch (error) {
    console.error('Error retrieving navigation state:', error);
    return defaultState;
  }
};

// Clear navigation state
export const clearNavigationState = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(NAVIGATION_STATE_KEY);
    console.log('Navigation state cleared successfully');
  } catch (error) {
    console.error('Error clearing navigation state:', error);
  }
};