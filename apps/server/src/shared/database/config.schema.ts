import { pgEnum, pgSchema } from "drizzle-orm/pg-core";

/**
 * SHARED SCHEMA CONFIGURATION
 */

export const ID_LENGTH = 36;

/**
 * USERS ENUMS SCHEMA
 */
export const userSignatureStatusEnum = pgEnum("signature_status", ["active", "inactive"]);

export const userRoleEnum = pgEnum("role", ["admin", "user"]);

export const notificationsStatusEnum = pgEnum("notifications", ["yes", "no"]);

/**
 * SUBSCRIPTION ENUMS SCHEMA
 */

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "active",
    "inactive",
    "expired",
    "cancelled",
    "pending",
    "suspended",
    "refunded",
    "failed",
    "disputed",
]);

/**
 * OTHER DEFINITIONS
 */

export const MAX_WATER_LEVEL: number = 0.5; // Defina o nível máximo de água desejado

/**
 * GOLD SCHEMA CONFIGURATION
 */

export const GOLD_SCHEMA = pgSchema("gold");
