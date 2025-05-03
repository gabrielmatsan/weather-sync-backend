import { t } from "elysia";

export const locationType = t.Object({
  id: t.Number(),
  name: t.String(),
  latitude: t.Number(),
  longitude: t.Number(),
  createdAt: t.String(),
  updatedAt: t.String(),
});
