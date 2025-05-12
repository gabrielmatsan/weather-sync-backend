import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia, { t } from "elysia";
import { addNewFavoritePlaceUseCase } from "../application/add-new-favorite-place.usecase";
import { getUserFavoritePlaceUseCase } from "../application/get-user-favorite-place.usecase";

export const UserController = new Elysia({
  prefix: "/users",
  tags: ["Users"],
})
  .use(authMiddleware)
  .post(
    "/favorite-place",
    async ({ body, set, validateToken }) => {
      try {
        const user = await validateToken();

        if (!user) {
          set.status = 401;
          throw new Error("Unauthorized");
        }

        const userId = user.id;

        const { placeId } = body;

        await addNewFavoritePlaceUseCase(
          { userId, placeId },
          repositories.placeRepository,
          repositories.favoritePlaceRepository
        );

        set.status = 201;
        return {
          status: "success",
          message: "Place added to favorites",
        };
      } catch (error) {
        set.status = 500;
        console.error("Error adding favorite place:", error);

        return {
          status: "error",
          message: "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        placeId: t.Number(),
      }),

      response: {
        201: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
    }
  )
  .get(
    "/favorite-place/:userId",
    async ({ params, set, validateToken }) => {
      try {
        const user = await validateToken();

        const userId = params.userId;

        if (!user) {
          throw new UnauthorizedError();
        }

        const response = await getUserFavoritePlaceUseCase(
          { userId },
          repositories.favoritePlaceRepository
        );

        set.status = 200;
        return {
          status: "success",
          data: response,
        };
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          set.status = 401;
          return {
            status: "error",
            message: error.message,
          };
        }
        console.error("GET /FAVORITE-PLACE/:userId => \n", error);

        set.status = 500;
        return {
          status: "error",
          message: "Internal server error",
        };
      }
    },
    {
      params: t.Object({
        userId: t.String(),
      }),

      response: {
        200: t.Object({
          status: t.String(),
          data: t.Array(
            t.Object({
              name: t.String(),
            })
          ),
        }),
        401: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        description: "Get all favorite places by userId",
        summary: "Get all favorite places by userId",
      },
    }
  );
