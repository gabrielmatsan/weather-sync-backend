import { t, type Static } from "elysia";

export const UserType = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 255 }),
  signatureStatus: t.Nullable(t.UnionEnum(["active", "inactive"])),
  phoneNumber: t.String({ minLength: 11, maxLength: 20 }),
  role: t.Nullable(t.UnionEnum(["admin", "user"])),
  notifications: t.Nullable(t.UnionEnum(["yes", "no"])),
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});

export type User = Static<typeof UserType>;
