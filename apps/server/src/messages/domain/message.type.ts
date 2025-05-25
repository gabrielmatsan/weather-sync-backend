import { t, type Static } from "elysia";

export const sendMessageSchema = t.Object({
  to: t.String({
    minLength: 10,
    maxLength: 15,
    description: "Phone number with country code (e.g., +559188772828)",
  }),
  place: t.String({
    minLength: 1,
    description: "Location name",
  }),
  floor: t.String({
    minLength: 1,
    description: "Water level",
  }),
});

export type Message = Static<typeof sendMessageSchema>;
