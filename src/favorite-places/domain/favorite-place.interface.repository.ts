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
  name: string;
}
