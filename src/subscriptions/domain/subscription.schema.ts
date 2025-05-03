import { ID_LENGTH, subscriptionStatusEnum } from "@/shared/config.schema";
import { subscriptionPlansSchema } from "@/subscription-plans/domain/subscription-plans.schema";
import { usersSchema } from "@/users/domain/users.schema";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const subscriptionsSchema = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: ID_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),

    userId: varchar("user_id", { length: ID_LENGTH }).references(
      () => usersSchema.id
    ),

    planId: integer("plan_id").references(() => subscriptionPlansSchema.id),

    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),

    status: subscriptionStatusEnum("status").default("inactive"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("subscriptions_user_id_index").on(t.userId)]
);

export const subscriptionsRelations = relations(
  subscriptionsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [subscriptionsSchema.userId],
      references: [usersSchema.id],
    }),
    plan: one(subscriptionPlansSchema, {
      fields: [subscriptionsSchema.planId],
      references: [subscriptionPlansSchema.id],
    }),
  })
);
