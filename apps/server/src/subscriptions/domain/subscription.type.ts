import { t } from "elysia";

export const subscriptionType = t.Object({
  id: t.Number(),
  userId: t.String(),
  placeId: t.Number(),
  startDate: t.Date(),
  endDate: t.Date(),
  status: t.UnionEnum([
    "active",
    "inactive",
    "expired",
    "cancelled",
    "pending",
    "suspended",
    "refunded",
    "failed",
    "disputed",
  ]),
  createdAt: t.String(),
  updatedAt: t.String(),
});
