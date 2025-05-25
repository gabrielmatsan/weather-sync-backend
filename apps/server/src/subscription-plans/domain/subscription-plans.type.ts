import { t } from "elysia";

export const subscriptionPlansType = t.Object({
  id: t.Number(),
  name: t.String(),
  description: t.String(),
  daysTimeDuration: t.String(),
  price: t.String(),
});


