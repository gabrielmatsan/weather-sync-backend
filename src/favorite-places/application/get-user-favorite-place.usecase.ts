import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import { t, type Static } from "elysia";

export const getUserFavoritePlaceUseCaseSchema = t.Object({
  userId: t.String(),
});

export type GetUserFavoritePlaceUseCaseSchema = Static<
  typeof getUserFavoritePlaceUseCaseSchema
>;
export async function getUserFavoritePlaceUseCase(
  { userId }: GetUserFavoritePlaceUseCaseSchema,
  favoritePlacesRepository: IFavoritePlaceRepository
) {
  return await favoritePlacesRepository.getFavoritePlacesByUserId(userId);
}
