import { placesSchema } from "@/places/domain/places.schema";
import { db } from "@/shared/database/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import type {
  FavoritePlaceRecord,
  IFavoritePlaceRepository,
  PlaceWithFavoriteStatus,
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
        id: placesSchema.id,
        name: placesSchema.name,
      })
      .from(favoritePlacesSchema)
      .innerJoin(
        placesSchema,
        eq(placesSchema.id, favoritePlacesSchema.placeId)
      )
      .where(eq(favoritePlacesSchema.userId, userId));
  }

  async removeFavoritePlace(
    userId: string,
    placeId: number
  ): Promise<FavoritePlaceRecord | null> {
    const [removedFavoritePlace] = await db
      .delete(favoritePlacesSchema)
      .where(
        and(
          eq(favoritePlacesSchema.userId, userId),
          eq(favoritePlacesSchema.placeId, placeId)
        )
      )
      .returning();

    if (!removedFavoritePlace) {
      return null;
    }

    return removedFavoritePlace;
  }
  async getUserNotFavoritedPlaces(
    userId: string
  ): Promise<UsersFavoritePlaces[]> {
    return await db
      .select({
        id: placesSchema.id,
        name: placesSchema.name,
      })
      .from(placesSchema)
      .leftJoin(
        favoritePlacesSchema,
        eq(placesSchema.id, favoritePlacesSchema.placeId)
      )
      .where(
        and(
          eq(favoritePlacesSchema.userId, userId),
          isNull(favoritePlacesSchema.placeId)
        )
      );
  }

  async getAllPlacesWithFavoriteStatus(
    userId: string
  ): Promise<PlaceWithFavoriteStatus[]> {
    // Busca todos os lugares
    const places = await db
      .select({ id: placesSchema.id, name: placesSchema.name })
      .from(placesSchema);

    console.log("Places: ", places);

    // Busca todos os locais favoritados pelo usuário
    const userFavoritePlaces = await db
      .select({ placeId: favoritePlacesSchema.placeId })
      .from(favoritePlacesSchema)
      .where(eq(favoritePlacesSchema.userId, userId));

    // Extrai apenas os IDs dos lugares favoritos para melhor performance
    const favoritePlaceIds = new Set(
      userFavoritePlaces.map((fp) => fp.placeId)
    );

    // Mapeia os lugares adicionando a flag isFavorite
    return places.map((place) => ({
      ...place,
      isFavorite: favoritePlaceIds.has(place.id),
    }));
  }
}
