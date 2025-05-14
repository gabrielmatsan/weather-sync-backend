import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { GOLD_SCHEMA } from "@/shared/database/config.schema";
import { relations } from "drizzle-orm";
import { index, integer, numeric, serial, timestamp } from "drizzle-orm/pg-core";

export const weatherSchema = GOLD_SCHEMA.table(
    "weather",
    {
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
        createdAt: timestamp("created_at"),
    },
    (t) => [
        index("idx_gold_weather_created_at").on(t.createdAt),
        index("idx_gold_weather_place_id").on(t.placeId),
    ],
);

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
