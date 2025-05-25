import type { IFavoritePlaceRepository } from "@/favorite-places/domain/favorite-place.interface.repository";
import { FavoritePlacesNotFoundError } from "@/shared/errors/favorite-places-not-found.error";

export async function userNotFavoritedPlaces(
    userId: string,
    favoritePlacesRepository: IFavoritePlaceRepository,
) {
    const favoritePlaces = await favoritePlacesRepository.getUserNotFavoritedPlaces(userId);

    if (favoritePlaces.length === 0) {
        throw new FavoritePlacesNotFoundError();
    }

    return { favoritePlaces };
}
