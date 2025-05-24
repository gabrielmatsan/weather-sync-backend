export interface IFavoritePlaceRepository {
  getUsersIdByPlaceId(placeId: number): Promise<FavoritePlaceRecord[]>;
  getFavoriteByPlaceIdAndUserId(
    placeId: number,
    userId: string
  ): Promise<FavoritePlaceRecord | null>;
  addNewFavoritePlace(
    userId: string,
    placeId: number
  ): Promise<FavoritePlaceRecord>;
  getFavoritePlacesByUserId(userId: string): Promise<UsersFavoritePlaces[]>;

  removeFavoritePlace(
    userId: string,
    placeId: number
  ): Promise<FavoritePlaceRecord | null>;

  getUserNotFavoritedPlaces(userId: string): Promise<UsersFavoritePlaces[]>;

  getAllPlacesWithFavoriteStatus(
    userId: string
  ): Promise<PlaceWithFavoriteStatus[]>;

  allFavoritePlaces(): Promise<FavoritePlaceRecord[]>;

  getFavoritePlacesByUserIdDetails(
    userId: string
  ): Promise<FavoritePlaceWithDetails[]>;
}

export interface FavoritePlaceWithDetails {
  id: number;
  name: string;
  userId: string;
  placeId: number;
  createdAt: Date;
}
export interface FavoritePlaceRecord {
  userId: string;
  placeId: number;
  createdAt: Date | null;
}

export interface CreateNewFavoritePlace {
  userId: string;
  placeId: number;
}

export interface UsersFavoritePlaces {
  id: number;
  name: string;
}
export interface PlaceWithFavoriteStatus extends UsersFavoritePlaces {
  isFavorite: boolean;
}
