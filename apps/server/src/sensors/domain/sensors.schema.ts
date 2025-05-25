import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { GOLD_SCHEMA } from "@/shared/database/config.schema";
import { relations } from "drizzle-orm";
import { integer, numeric, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const sensorsSchema = GOLD_SCHEMA.table("sensors", {
    id: serial("id").primaryKey().notNull(),
    placeId: integer("place_id")
        .references(() => placesSchema.id)
        .notNull(),
    sourceId: integer("source_id")
        .references(() => dataSourceSchema.id)
        .notNull(),
    waterLevel: numeric("water_level", { precision: 10, scale: 6 }).notNull(),
    waterLevelUnit: varchar("water_level_unit", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    checkedAt: timestamp("checked", { withTimezone: true }),
});

export const sensorsRelations = relations(sensorsSchema, ({ one }) => ({
    source: one(dataSourceSchema, {
        fields: [sensorsSchema.sourceId],
        references: [dataSourceSchema.id],
    }),
    place: one(placesSchema, {
        fields: [sensorsSchema.placeId],
        references: [placesSchema.id],
    }),
}));
