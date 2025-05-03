import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const dataSourceSchema = pgTable("data_source", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
});
