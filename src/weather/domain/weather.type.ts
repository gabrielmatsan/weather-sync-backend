import { t, type Static } from "elysia";

export const weatherType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  sourceId: t.Number(),
  temperature: t.String(),
  humidity: t.Number(),
  pressure: t.Number(),
  windSpeed: t.String(),
  windDirection: t.Number(),
  createdAt: t.Nullable(t.Date()),
});

export type Weather = Static<typeof weatherType>;
