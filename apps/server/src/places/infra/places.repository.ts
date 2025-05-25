import { db } from "@/shared/database/db";
import { eq, like } from "drizzle-orm";
import type {
  IPlaceRepository,
  PlaceRecord,
} from "../domain/place-repository.interface";
import { placesSchema } from "../domain/places.schema";

export class PlaceRepository implements IPlaceRepository {
  async getPlaceById(id: number): Promise<PlaceRecord | null> {
    const [place] = await db
      .select()
      .from(placesSchema)
      .where(eq(placesSchema.id, id));

    if (!place) {
      return null;
    }

    return place;
  }
  async getAllPlaces(): Promise<PlaceRecord[]> {
    const places = await db.select().from(placesSchema);
    if (places.length <= 0) {
      return [];
    }
    return places;
  }
  async getPlaceByName(name: string): Promise<PlaceRecord[]> {
    const place = await db
      .select()
      .from(placesSchema)
      .where(like(placesSchema.name, `%${name}%`));

    if (place.length <= 0) {
      return [];
    }

    return place;
  }
}
