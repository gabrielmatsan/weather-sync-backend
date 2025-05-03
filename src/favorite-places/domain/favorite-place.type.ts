import { t } from "elysia";

export const favoritePlaceType = t.Object({
  userId: t.String(),
  placeId: t.Number(),
  createdAt: t.String(),
});
