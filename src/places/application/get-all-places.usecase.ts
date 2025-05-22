import type { IPlaceRepository } from "../domain/place-repository.interface";
import type { Place } from "../domain/place.type";

export async function getAllPlacesUseCase(
  placeRepository: IPlaceRepository
): Promise<Place[]> {
  const places = await placeRepository.getAllPlaces();

  return places.map((place) => ({
    ...place,
    latitude: parseFloat(place.latitude),
    longitude: parseFloat(place.longitude),
    createdAt: place.createdAt ? new Date(place.createdAt) : new Date(0),
    updatedAt: place.updatedAt ? new Date(place.updatedAt) : new Date(0),
  }));
}
