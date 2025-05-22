import { GOLD_SCHEMA } from "@/shared/database/config.schema";
import { serial, varchar } from "drizzle-orm/pg-core";

export const dataSourceSchema = GOLD_SCHEMA.table("data_source", {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
});
