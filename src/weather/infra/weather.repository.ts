import { db } from "@/shared/database/db";
import { and, eq, gte, lte } from "drizzle-orm";
import type { IWeatherRepository } from "../domain/weather-repository.interface";
import { weatherSchema } from "../domain/weather.schema";
import type { Weather } from "../domain/weather.type";

export class WeatherRepository implements IWeatherRepository {
  async getWeatherByPlaceIdAndDate(
    date: Date,
    placeId: number
  ): Promise<Weather[]> {
    // Início do dia (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Fim do dia (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(weatherSchema)
      .where(
        and(
          gte(weatherSchema.createdAt, startOfDay),
          lte(weatherSchema.createdAt, endOfDay),
          eq(weatherSchema.placeId, placeId)
        )
      );
  }
}
