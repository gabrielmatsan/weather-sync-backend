import { t } from "elysia";

export const weatherType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  sourceId: t.Number(),
  temperature: t.Number(),
  humidity: t.Number(),
  pressure: t.Number(),
  windSpeed: t.Number(),
  windDirection: t.Number(),
  createdAt: t.String(),
  updatedAt: t.String(),
});
