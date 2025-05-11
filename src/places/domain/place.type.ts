import { t, type Static } from "elysia";

export const placeType = t.Object({
  id: t.Number(),
  name: t.String(),
  latitude: t.Number(),
  longitude: t.Number(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Place = Static<typeof placeType>;
