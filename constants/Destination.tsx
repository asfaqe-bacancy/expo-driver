import { Coordinates } from "./Interface";

export interface Destination {
  id: string;
  name: string;
  coordinates: Coordinates;
  address: string;
  distance?: number; // Can be calculated dynamically
}

export const DESTINATIONS: Destination[] = [
  {
    id: "palladium",
    name: "Palladium Mall",
    coordinates: {
      lat: 23.058746,
      lng: 72.521035,
    },
    address: "Palladium Mall, Ahmedabad",
  },
  {
    id: "alphaone",
    name: "AlphaOne Mall",
    coordinates: {
      lat: 23.040149,
      lng: 72.5287451,
    },
    address: "AlphaOne Mall, Ahmedabad",
  },
];
