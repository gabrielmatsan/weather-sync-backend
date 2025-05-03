import { ID_LENGTH } from "@/shared/schema.config";
import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
  id: varchar("id", { length: ID_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});
