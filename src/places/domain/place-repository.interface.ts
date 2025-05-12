export interface PlaceRecord {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IPlaceRepository {
  getPlaceById(id: number): Promise<PlaceRecord | null>;

  getAllPlaces(): Promise<PlaceRecord[]>;

  getPlaceByName(name: string): Promise<PlaceRecord[]>;
}
