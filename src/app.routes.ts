import Elysia from "elysia";
import { AuthController } from "./auth/infra/auth.controller";
import { MessageController } from "./messages/infra/message.controller";
import { PlaceController } from "./places/infra/place.controller";
import { UserController } from "./users/infra/user.controller";

export const routes = new Elysia({ prefix: "/v1" })
    .use(AuthController)
    .use(MessageController)
    .use(PlaceController)
    .use(UserController);
