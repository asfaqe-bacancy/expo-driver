import { isValidCoordinates } from "@/utils/mapUtils";
import { useState } from "react";

interface NavigationState {
  startCoordinates: string;
  driverCoordinates: string;
  endCoordinates: string;
  showDirections: boolean;
  travelTime: string;
}

export const useNavigationState = (initialEndCoordinates: string = "") => {
  const [state, setState] = useState<NavigationState>({
    startCoordinates: "",
    driverCoordinates: "",
    endCoordinates: initialEndCoordinates,
    showDirections: false,
    travelTime: "",
  });

  const updateDriverLocation = (coordinates: string) => {
    setState((prev) => ({
      ...prev,
      driverCoordinates: coordinates,
      // Update start coordinates if navigation is active
      startCoordinates: prev.showDirections
        ? coordinates
        : prev.startCoordinates,
    }));
  };

  const setDestination = (coordinates: string) => {
    setState((prev) => ({
      ...prev,
      endCoordinates: coordinates,
      showDirections: false,
      travelTime: "",
    }));
  };

  const startNavigation = () => {
    if (!isValidCoordinates(state.endCoordinates)) {
      throw new Error("Please enter valid destination coordinates");
    }
    setState((prev) => ({ ...prev, showDirections: true }));
  };

  const stopNavigation = () => {
    setState((prev) => ({
      ...prev,
      showDirections: false,
      travelTime: "",
    }));
  };

  const updateTravelTime = (time: string) => {
    setState((prev) => ({ ...prev, travelTime: time }));
  };

  return {
    ...state,
    updateDriverLocation,
    setDestination,
    startNavigation,
    stopNavigation,
    updateTravelTime,
  };
};
