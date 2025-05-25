import { placesSchema } from "@/places/domain/places.schema";
import { ID_LENGTH } from "@/shared/database/config.schema";
import { usersSchema } from "@/users/domain/users.schema";
import { relations } from "drizzle-orm";
import { index, integer, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const favoritePlacesSchema = pgTable(
    "favorite_places",
    {
        userId: varchar("user_id", { length: ID_LENGTH })
            .references(() => usersSchema.id)
            .notNull(),
        placeId: integer("place_id")
            .references(() => placesSchema.id)
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (t) => [
        primaryKey({ columns: [t.userId, t.placeId] }),
        index("favorite_places_user_id").on(t.userId),
        index("favorite_places_place_id").on(t.placeId),
    ],
);

export const favoritePlacesRelations = relations(favoritePlacesSchema, ({ one }) => ({
    place: one(placesSchema, {
        fields: [favoritePlacesSchema.placeId],
        references: [placesSchema.id],
    }),
    user: one(usersSchema, {
        fields: [favoritePlacesSchema.userId],
        references: [usersSchema.id],
    }),
}));
