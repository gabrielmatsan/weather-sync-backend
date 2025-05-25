import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import { FavoritePlacesNotFoundError } from "@/shared/errors/favorite-places-not-found.error";

export async function userFavoritePlacesUsecase(
    userId: string,
    favoritePlacesRepository: IFavoritePlaceRepository,
) {
    const favoritePlaces = await favoritePlacesRepository.getFavoritePlacesByUserId(userId);

    if (!favoritePlaces) {
        throw new FavoritePlacesNotFoundError();
    }

    return { favoritePlaces };
}
