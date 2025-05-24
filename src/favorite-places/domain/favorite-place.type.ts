import { t, type Static } from "elysia";

export const favoritePlaceType = t.Object({
  userId: t.String(),
  placeId: t.Number(),
  createdAt: t.Date(),
  name: t.Optional(t.String()),
});

export type FavoritePlaceType = Static<typeof favoritePlaceType>;
