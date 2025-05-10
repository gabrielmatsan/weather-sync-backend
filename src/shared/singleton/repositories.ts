import { FavoritePlacesRepository } from "@/favorite-places/infra/favorite-places.repository";
import { UsersRepository } from "@/users/infra/users.repository";
import { PlaceRepository } from "./../../places/infra/places.repository";

/**
 * Singleton pattern for repositories
 */
const userRepository = new UsersRepository();
const placeRepository = new PlaceRepository();
const favoritePlaceRepository = new FavoritePlacesRepository();

export const repositories = {
  userRepository,
  placeRepository,
  favoritePlaceRepository,
};
