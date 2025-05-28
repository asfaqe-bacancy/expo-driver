import { Destination } from '@/constants/Destination';
import { Coordinates } from '@/constants/Interface';
import {
    clearNavigationState,
    getNavigationState,
    saveNavigationState
} from '@/utils/navigationStorage';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

export const usePersistedNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeNavigation, setActiveNavigation] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null);

  // Load persisted navigation state on component mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedState = await getNavigationState();
        
        if (persistedState.isNavigationActive && persistedState.destinationId) {
          setActiveNavigation(true);
          
          // Recreate the destination object
          if (persistedState.destinationName && persistedState.destinationCoordinates) {
            setCurrentDestination({
              id: persistedState.destinationId,
              name: persistedState.destinationName,
              coordinates: persistedState.destinationCoordinates,
              address: persistedState.destinationName // We don't store the full address
            });
          }
          
          setNavigationStartTime(persistedState.startTime);
        }
      } catch (error) {
        console.error('Error loading persisted navigation state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
  }, []);

  // Prevent back button when navigation is active
  useEffect(() => {
    const handleBackPress = () => {
      if (activeNavigation) {
        Alert.alert(
          "Navigation Active",
          "You cannot leave the app while navigation is active. Complete your delivery first.",
          [{ text: "OK" }]
        );
        return true; // Prevent default back button behavior
      }
      return false; // Allow default back button behavior
    };


    const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        function () {
          /**
           * this.onMainScreen and this.goBack are just examples,
           * you need to use your own implementation here.
           *
           * Typically you would use the navigator here to go to the last state.
           */
      
        //   if (!this.onMainScreen()) {
        //     this.goBack();
        //     /**
        //      * When true is returned the event will not be bubbled up
        //      * & no other back action will execute
        //      */
        //     return true;
        //   }
          /**
           * Returning false will let the event to bubble up & let other event listeners
           * or the system's default back action to be executed.
           */
          return false;
        },
      );
      
      // Unsubscribe the listener on unmount
      


    
    return () => {
        subscription.remove();
    };
  }, [activeNavigation]);

  // Start navigation and persist the state
  const startNavigation = useCallback(async (destination: Destination, driverCoords: Coordinates) => {
    const startTime = Date.now();
    setActiveNavigation(true);
    setCurrentDestination(destination);
    setNavigationStartTime(startTime);

    // Save to storage
    await saveNavigationState({
      isNavigationActive: true,
      destinationId: destination.id,
      destinationName: destination.name,
      destinationCoordinates: destination.coordinates,
      startTime: startTime,
      driverCoordinates: driverCoords,
    });
  }, []);

  // End navigation and clear the persisted state
  const endNavigation = useCallback(async () => {
    // Ask for confirmation
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "End Navigation",
        "Are you sure you want to end the current navigation?",
        [
          { 
            text: "Cancel", 
            style: "cancel",
            onPress: () => resolve(false)
          },
          { 
            text: "End Navigation", 
            style: "destructive",
            onPress: async () => {
              setActiveNavigation(false);
              setCurrentDestination(null);
              setNavigationStartTime(null);
              await clearNavigationState();
              resolve(true);
            }
          }
        ]
      );
    });
  }, []);

  return {
    isLoading,
    activeNavigation,
    currentDestination,
    navigationStartTime,
    startNavigation,
    endNavigation
  };
};