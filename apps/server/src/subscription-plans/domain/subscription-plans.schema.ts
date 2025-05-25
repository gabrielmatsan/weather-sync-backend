import { numeric, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const subscriptionPlansSchema = pgTable("subscription_plans", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  daysTimeDuration: varchar("days_time_duration", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});
