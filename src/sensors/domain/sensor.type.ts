import { t, type Static } from "elysia";

export const SensorType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  sourceId: t.Number(),
  waterLevel: t.Number(),
  waterLevelUnit: t.String(),
  createdAt: t.Nullable(t.Date()),
});

export type Sensor = Static<typeof SensorType>;
