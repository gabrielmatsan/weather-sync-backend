import { db } from "@/shared/database/db";
import { desc, eq } from "drizzle-orm";
import type { ISensorRepository } from "../domain/sensor-repository.interface";
import type { Sensor } from "../domain/sensor.type";
import { sensorsSchema } from "../domain/sensors.schema";

export class SensorRepository implements ISensorRepository {
  async getDataByLocalId(placeId: number): Promise<Sensor | null> {
    let [sensorData] = await db
      .select()
      .from(sensorsSchema)
      .where(eq(sensorsSchema.placeId, placeId))
      .orderBy(desc(sensorsSchema.createdAt))
      .limit(1);

    return {
      ...sensorData,
      waterLevel: Number(sensorData.waterLevel),
    };
  }
}
