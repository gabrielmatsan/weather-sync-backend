import type { FavoritePlaceRecord } from "../infra/favorite-places.repository";

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
}
