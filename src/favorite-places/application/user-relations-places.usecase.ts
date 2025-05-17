import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";

export async function getUserRelationsPlacesUseCase(
  userId: string,
  favoritePlacesRepostiory: IFavoritePlaceRepository
) {
  const userRelationsPlaces =
    await favoritePlacesRepostiory.getAllPlacesWithFavoriteStatus(userId);

  if (!userRelationsPlaces) {
    throw new Error("User relations places not found");
  }

  return {
    userRelationsPlaces,
  };
}
