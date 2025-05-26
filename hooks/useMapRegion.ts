import { DEFAULT_REGION, MapRegion } from "@/utils/mapUtils";
import { useState } from "react";

export const useMapRegion = (initialRegion: MapRegion = DEFAULT_REGION) => {
  const [region, setRegion] = useState<MapRegion>(initialRegion);

  const updateRegionFromCoordinates = (latitude: number, longitude: number) => {
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  return {
    region,
    setRegion,
    updateRegionFromCoordinates,
  };
};
