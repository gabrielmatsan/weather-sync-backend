import type { Place } from "./place.type";

export interface IPlaceRepository {
  getPlaceById(id: number): Promise<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  getAllPlaces(): Promise<Place[] | null>;
}
