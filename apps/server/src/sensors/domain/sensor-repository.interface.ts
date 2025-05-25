import type { Sensor } from "./sensor.type";

export interface ISensorRepository {
  getDataByLocalId(localId: number): Promise<Sensor | null>;
}
