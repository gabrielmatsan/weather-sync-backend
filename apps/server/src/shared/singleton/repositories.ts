import { FavoritePlacesRepository } from "@/favorite-places/infra/favorite-places.repository";
import { SensorsRepository } from "@/sensors/infra/sensors.repository";
import { UsersRepository } from "@/users/infra/users.repository";
import { PlaceRepository } from "./../../places/infra/places.repository";

/**
 * Singleton pattern for repositories
 */
const userRepository = new UsersRepository();
const placeRepository = new PlaceRepository();
const favoritePlaceRepository = new FavoritePlacesRepository();
const sensorRepository = new SensorsRepository();

export const repositories = {
  userRepository,
  placeRepository,
  favoritePlaceRepository,
  sensorRepository,
};
