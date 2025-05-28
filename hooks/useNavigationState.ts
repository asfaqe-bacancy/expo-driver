import { Destination } from '@/constants/Destination';
import { Coordinates } from '@/constants/Interface';
import { startBackgroundLocationUpdates, stopBackgroundLocationUpdates } from '@/utils/BackgroundLocationService';
import { calculateDistance, isValidCoordinates, stringToCoordinates } from '@/utils/mapUtils';
import { clearNavigationState, saveNavigationState } from '@/utils/navigationStorage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const ARRIVAL_THRESHOLD = 30;

interface NavigationState {
  startCoordinates: Coordinates | null;
  driverCoordinates: Coordinates | null;
  endCoordinates: Coordinates | null;
  showDirections: boolean;
  travelTime: string;
  isActive: boolean; // Add this to track navigation state
}

export const useNavigationState = (initialEndCoordinatesStr: string = "") => {
  const initialEndCoordinates = stringToCoordinates(initialEndCoordinatesStr);
  
  const [state, setState] = useState<NavigationState>({
    startCoordinates: null,
    driverCoordinates: null,
    endCoordinates: initialEndCoordinates,
    showDirections: false,
    travelTime: "",
    isActive: false, // Add initial state
  });

  useEffect(() => {
    const checkArrival = async () => {
      if (
        state.isActive && 
        state.driverCoordinates && 
        state.endCoordinates &&
        isValidCoordinates(state.driverCoordinates) && 
        isValidCoordinates(state.endCoordinates)
      ) {
        const distance = calculateDistance(
          state.driverCoordinates.lat,
          state.driverCoordinates.lng,
          state.endCoordinates.lat,
          state.endCoordinates.lng
        );

        if (distance <= ARRIVAL_THRESHOLD) {
          // Reset all navigation state
          await completeNavigation();
        }
      }
    };

    checkArrival();
  }, [state.driverCoordinates, state.endCoordinates, state.isActive]);

  const completeNavigation = async () => {
    try {
      // Stop background location updates
      await stopBackgroundLocationUpdates();

      // Clear navigation state
      setState(prev => ({
        ...prev,
        isActive: false,
        endCoordinates: null,
        showDirections: false,
        travelTime: "",
        driverCoordinates: null
      }));

      // Clear persisted state
      await clearNavigationState();

      // Navigate to completion screen
      router.replace('/deliverycomplete');
    } catch (error) {
      console.error('Error completing navigation:', error);
    }
  };


  const updateDriverLocation = (coordinates: Coordinates) => {
    setState((prev) => ({
      ...prev,
      driverCoordinates: coordinates,
    }));
  };

  const setDestination = (coordinates: Coordinates) => {
    setState((prev) => ({
      ...prev,
      endCoordinates: coordinates,
    }));
  };

  const startNavigation = useCallback(async (destination: Destination, driverCoords: Coordinates) => {
    try {
      // Start background location tracking
      await startBackgroundLocationUpdates(destination.coordinates);
      
      // Update local state
      setState(prev => ({
        ...prev,
        isActive: true,
        endCoordinates: destination.coordinates,
        driverCoordinates: driverCoords
      }));

      // Save to storage
      await saveNavigationState({
        isNavigationActive: true,
        destinationId: destination.id,
        destinationName: destination.name,
        destinationCoordinates: destination.coordinates,
        startTime: Date.now(),
        driverCoordinates: driverCoords,
      });
    } catch (error) {
      console.error('Failed to start navigation:', error);
      throw error;
    }
  }, []);

  const endNavigation = useCallback(async () => {
    try {
      // Stop background location tracking
      await stopBackgroundLocationUpdates();
      
      // Clear local state
      setState(prev => ({
        ...prev,
        isActive: false,
        endCoordinates: null,
        showDirections: false,
        travelTime: ""
      }));

      // Clear persisted state
      await clearNavigationState();
    } catch (error) {
      console.error('Failed to end navigation:', error);
      throw error;
    }
  }, []);

  const resetNavigationState = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      endCoordinates: null,
      showDirections: false,
      travelTime: "",
      driverCoordinates: null
    }));
  }, []);

  return {
    ...state,
    updateDriverLocation,
    setEndCoordinates: (coords: Coordinates) => 
      setState(prev => ({ ...prev, endCoordinates: coords })),
    setShowDirections: (show: boolean) => 
      setState(prev => ({ ...prev, showDirections: show })),
    setTravelTime: (time: string) => 
      setState(prev => ({ ...prev, travelTime: time })),
    completeNavigation,
    resetNavigationState
  };
};