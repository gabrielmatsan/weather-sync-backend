import { authMiddleware } from "@/shared/infra/auth.middleware";
import Elysia from "elysia";

export const UserController = new Elysia({
  prefix: "/users",
  tags: ["Users"],
}).use(authMiddleware);
