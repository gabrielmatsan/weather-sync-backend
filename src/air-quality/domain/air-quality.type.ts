import { t } from "elysia";

export const airQualityType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  sourceId: t.Number(),
  aqiUniversal: t.Number(),
  nameDisplay: t.String(),
  displayValue: t.Number(),
  createdAt: t.String(),
});
