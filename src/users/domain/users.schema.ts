import {
  ID_LENGTH,
  notificationsStatusEnum,
  userRoleEnum,
  userSignatureStatusEnum,
} from "@/shared/config.schema";
import { createId } from "@paralleldrive/cuid2";
import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const usersSchema = pgTable(
  "users",
  {
    id: varchar("id", { length: ID_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    signatureStatus:
      userSignatureStatusEnum("signature_status").default("inactive"),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    role: userRoleEnum("role").default("user"),
    notifications: notificationsStatusEnum("notifications").default("yes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    uniqueIndex("users_email_index").on(t.email),
    uniqueIndex("users_phone_number_index").on(t.phoneNumber),
  ]
);
