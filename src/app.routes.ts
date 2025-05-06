import Elysia from "elysia";
import { AuthController } from "./auth/infra/auth.controller";
import { MessageController } from "./messages/infra/message.controller";

export const routes = new Elysia({ prefix: "/v1" })
  .use(AuthController)
  .use(MessageController);
