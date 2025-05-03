import { t } from "elysia";

export const sensorType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  sourceId: t.Number(),
  waterLevel: t.Number(),
  waterLevelUnit: t.String(),
  createdAt: t.Date(),
});
