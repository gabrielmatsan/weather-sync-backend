import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import type { IPlaceRepository } from "@/places/domain/place-repository.interface";
import { t, type Static } from "elysia";

export const addNewFavoritePlaceUseCaseInputSchema = t.Object({
  userId: t.String(),
  placeId: t.Number(),
});
export type AddNewFavoritePlaceUseCaseInput = Static<
  typeof addNewFavoritePlaceUseCaseInputSchema
>;
export async function addNewFavoritePlaceUseCase(
  data: AddNewFavoritePlaceUseCaseInput,
  placeRepository: IPlaceRepository,
  favoritePlaceRepository: IFavoritePlaceRepository
) {
  const isPlaceAlreadyExists = await placeRepository.getPlaceById(data.placeId);

  if (!isPlaceAlreadyExists) {
    throw new Error("Place not found");
  }

  const thisUserAlreadyHasThisPlace =
    await favoritePlaceRepository.getFavoriteByPlaceIdAndUserId(
      data.placeId,
      data.userId
    );

  if (thisUserAlreadyHasThisPlace) {
    throw new Error("This user already has this place");
  }

  await favoritePlaceRepository.addNewFavoritePlace(data.userId, data.placeId);
}
