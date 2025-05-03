import { pgEnum } from "drizzle-orm/pg-core";

/**
 * SHARED SCHEMA CONFIGURATION
 */

export const ID_LENGTH = 36;

/**
 * USERS ENUMS SCHEMA
 */
export const userSignatureStatusEnum = pgEnum("signature_status", [
  "active",
  "inactive",
]);

export const userRoleEnum = pgEnum("role", ["admin", "user"]);

export const notificationsStatusEnum = pgEnum("notifications", ["yes", "no"]);
