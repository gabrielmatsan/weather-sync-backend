import Elysia from "elysia";
import { AuthController } from "./auth/infra/auth.controller";

export const routes = new Elysia({ prefix: "/v1" }).use(AuthController);
