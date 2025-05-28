import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = () => {
  const appStateRef = useRef(AppState.currentState);
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Debug info - log all transitions to understand the pattern
      console.log(`[DEBUG] App State transition: ${appStateRef.current} → ${nextAppState}`);
      
      // Only handle actual background/foreground transitions
      if (
        (appStateRef.current.match(/active/) && nextAppState.match(/inactive|background/)) ||
        (appStateRef.current.match(/inactive|background/) && nextAppState.match(/active/))
      ) {
        console.log(`App State changed from ${appStateRef.current} to ${nextAppState}`);
        
        if (nextAppState === 'active') {
          console.log("App has come to the foreground!");
        } else if (nextAppState.match(/background/)) {
          console.log("App has gone to the background!");
        }
      }
      
      appStateRef.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // If you need to check and update location when app becomes active
  const checkAndUpdateStartLocation = () => {
    // Do nothing for now to prevent any unintended side effects
  };

  return {
    checkAndUpdateStartLocation,
  };
};