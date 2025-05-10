import { db } from "@/shared/database/db";
import { eq } from "drizzle-orm";
import type { IPlaceRepository } from "../domain/place-repository.interface";
import type { Place } from "../domain/place.type";
import { placesSchema } from "../domain/places.schema";

export class PlaceRepository implements IPlaceRepository {
  async getPlaceById(id: number): Promise<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const [place] = await db
      .select()
      .from(placesSchema)
      .where(eq(placesSchema.id, id));

    return place
      ? {
          ...place,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          createdAt: place.createdAt ?? new Date(),
          updatedAt: place.updatedAt ?? new Date(),
        }
      : null;
  }
  async getAllPlaces(): Promise<Place[] | null> {
    const places = await db.select().from(placesSchema);
    if (places.length <= 0) {
      return null;
    }
    return places.map((place) => {
      return {
        ...place,
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        createdAt: place.createdAt ?? new Date(0),
        updatedAt: place.updatedAt ?? new Date(0),
      };
    });
  }
}
