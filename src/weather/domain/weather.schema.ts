import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const weatherSchema = pgTable("weather", {
  id: serial("id").primaryKey().notNull(),
  placeId: integer("place_id")
    .references(() => placesSchema.id)
    .notNull(),
  sourceId: integer("source_id")
    .references(() => dataSourceSchema.id)
    .notNull(),
  temperature: numeric("temperature", { precision: 5, scale: 2 }).notNull(),
  humidity: integer("humidity").notNull(),
  pressure: integer("pression").notNull(),
  windSpeed: numeric("wind_speed", { precision: 4, scale: 2 }).notNull(),
  windDirection: integer("wind_direction").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const weatherRelations = relations(weatherSchema, ({ one }) => ({
  place: one(placesSchema, {
    fields: [weatherSchema.placeId],
    references: [placesSchema.id],
  }),
  source: one(dataSourceSchema, {
    fields: [weatherSchema.sourceId],
    references: [dataSourceSchema.id],
  }),
}));
