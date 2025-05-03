import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const airQualitySchema = pgTable("air_quality", {
  id: serial("id").primaryKey().notNull(),
  placeId: integer("place_id")
    .references(() => placesSchema.id)
    .notNull(),
  sourceId: integer("source_id")
    .references(() => dataSourceSchema.id)
    .notNull(),
  aqiUniversal: integer("aqi_universal").notNull(),
  nameDisplay: varchar("name_display", { length: 50 }).notNull(),
  displayValue: integer("display_value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const airQualityRelations = relations(airQualitySchema, ({ one }) => ({
  place: one(placesSchema, {
    fields: [airQualitySchema.placeId],
    references: [placesSchema.id],
  }),
  source: one(dataSourceSchema, {
    fields: [airQualitySchema.sourceId],
    references: [dataSourceSchema.id],
  }),
}));
