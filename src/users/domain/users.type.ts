import { t } from "elysia";

export const usersType = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 255 }),
  signatureStatus: t.UnionEnum(["active", "inactive"]),
  phoneNumber: t.String({ minLength: 11, maxLength: 20 }),
  role: t.UnionEnum(["admin", "user"]),
  notifications: t.UnionEnum(["yes", "no"]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
