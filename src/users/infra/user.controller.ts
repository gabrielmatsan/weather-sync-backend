import { authMiddleware } from "@/shared/infra/auth.middleware";
import Elysia from "elysia";

export const UserController = new Elysia().use(authMiddleware);
