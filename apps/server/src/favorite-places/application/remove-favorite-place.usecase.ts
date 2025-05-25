import { t, type Static } from "elysia";
import type { IFavoritePlaceRepository } from "../domain/favorite-place.interface.repository";

export const removedFavoritePlaceUseCaseSchema = t.Object({
  userId: t.String(),
  placeId: t.Number(),
});

export type RemovedFavoritePlaceUseCaseSchema = Static<
  typeof removedFavoritePlaceUseCaseSchema
>;

export async function removeFavoritePlace(
  { userId, placeId }: RemovedFavoritePlaceUseCaseSchema,
  favoritePlaceRepository: IFavoritePlaceRepository
) {
  const isFavoritePlaceExists =
    await favoritePlaceRepository.getFavoriteByPlaceIdAndUserId(
      placeId,
      userId
    );

  if (!isFavoritePlaceExists) {
    throw new Error("Favorite place not found");
  }

  const isFavoritePlaceRemoved =
    await favoritePlaceRepository.removeFavoritePlace(userId, placeId);

  return {
    isFavoritePlaceRemoved,
  };
}
