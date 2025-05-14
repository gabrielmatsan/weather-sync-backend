import { GOLD_SCHEMA } from "@/shared/database/config.schema";
import { numeric, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const placesSchema = GOLD_SCHEMA.table("places", {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    latitude: numeric("latitude", { precision: 11, scale: 8 }).notNull(),
    longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
