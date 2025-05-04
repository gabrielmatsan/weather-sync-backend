import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const pollutantsSchema = pgTable(
  "pollutants",
  {
    id: serial("id").primaryKey().notNull(),
    placeId: integer("place_id")
      .references(() => placesSchema.id)
      .notNull(),
    sourceId: integer("source_id")
      .references(() => dataSourceSchema.id)
      .notNull(),
    dominantPollutant: varchar("dominant_pollutant", { length: 255 }).notNull(),
    coValue: numeric("co_concentration", { precision: 10, scale: 6 }).notNull(),
    coMetricUnit: varchar("co_metric_unit", { length: 30 }).notNull(),
    createdAt: timestamp("created_at"),
  },
  (t) => [
    index("idx_gold_pollutants_created_at").on(t.createdAt),
    index("idx_gold_pollutants_place_id").on(t.placeId),
    index("idx_gold_pollutants_place_id").on(t.sourceId),
  ]
);

export const pollutantsRelations = relations(pollutantsSchema, ({ one }) => ({
  source: one(dataSourceSchema, {
    fields: [pollutantsSchema.sourceId],
    references: [dataSourceSchema.id],
  }),
  place: one(placesSchema, {
    fields: [pollutantsSchema.placeId],
    references: [placesSchema.id],
  }),
}));
