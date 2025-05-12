import { placesSchema } from "@/places/domain/places.schema";
import { db } from "@/shared/database/db";
import { and, eq } from "drizzle-orm";
import type {
  FavoritePlaceRecord,
  IFavoritePlaceRepository,
  UsersFavoritePlaces,
} from "../domain/favorite-place.interface.repository";
import { favoritePlacesSchema } from "../domain/favorite-places.schema";

export class FavoritePlacesRepository implements IFavoritePlaceRepository {
  async addNewFavoritePlace(
    userId: string,
    placeId: number
  ): Promise<FavoritePlaceRecord> {
    const [favoritePlace] = await db
      .insert(favoritePlacesSchema)
      .values({
        userId,
        placeId,
      })
      .returning();

    return favoritePlace;
  }
  async getUsersIdByPlaceId(placeId: number): Promise<FavoritePlaceRecord[]> {
    return await db
      .select()
      .from(favoritePlacesSchema)
      .where(eq(favoritePlacesSchema.placeId, placeId));
  }

  async getFavoriteByPlaceIdAndUserId(placeId: number, userId: string) {
    const [favoritePlace] = await db
      .select()
      .from(favoritePlacesSchema)
      .where(
        and(
          eq(favoritePlacesSchema.placeId, placeId),
          eq(favoritePlacesSchema.userId, userId)
        )
      )
      .limit(1);

    return favoritePlace;
  }

  async getFavoritePlacesByUserId(
    userId: string
  ): Promise<UsersFavoritePlaces[]> {
    return await db
      .select({
        name: placesSchema.name,
      })
      .from(favoritePlacesSchema)
      .innerJoin(
        placesSchema,
        eq(placesSchema.id, favoritePlacesSchema.placeId)
      )
      .where(eq(favoritePlacesSchema.userId, userId));
  }
}
