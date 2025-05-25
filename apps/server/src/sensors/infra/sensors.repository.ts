import { db } from "@/shared/database/db";
import { eq, isNull } from "drizzle-orm";
import type { ISensorsRepository } from "../domain/sensors-repository.interface";
import { sensorsSchema } from "../domain/sensors.schema";

export class SensorsRepository implements ISensorsRepository {
  async getNewSensorsData(): Promise<
    | {
        placeId: number;
        waterLevel: number;
        waterLevelUnit: string;
        createdAt: Date;
      }[]
  > {
    const sensorsData = await db
      .select()
      .from(sensorsSchema)
      .where(isNull(sensorsSchema.checkedAt));

    await Promise.all(
      sensorsData.map(async (sensor) => {
        db.update(sensorsSchema)
          .set({
            checkedAt: new Date(),
          })
          .where(eq(sensorsSchema.id, sensor.id));
      })
    );

    return sensorsData.map((sensor) => ({
      placeId: sensor.placeId,
      waterLevel: Number(sensor.waterLevel) ?? 0,
      waterLevelUnit: sensor.waterLevelUnit,
      createdAt: sensor.createdAt || new Date(),
    }));
  }
}
