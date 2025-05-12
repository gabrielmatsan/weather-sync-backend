import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia, { t } from "elysia";
import { removeFavoritePlace } from "../application/remove-favorite-place.usecase";

export const FavoritePlaceController = new Elysia({
  prefix: "/favorite-places",
  tags: ["Favorite Places"],
})
  .use(authMiddleware)
  .delete(
    "/:placeId",
    async ({ set, params, validateToken }) => {
      try {
        const user = await validateToken();
        if (!user) {
          set.status = 401;
          throw new UnauthorizedError();
        }

        const userId = user.id;
        const placeId = Number(params.placeId);

        await removeFavoritePlace(
          { userId, placeId },
          repositories.favoritePlaceRepository
        );

        set.status = 200;
        return {
          status: "success",
          message: "Place removed from favorites",
        };
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          set.status = 401;
          return {
            status: "error",
            message: e.message,
          };
        }

        console.error("Error removing favorite place:", e);

        set.status = 500;
        return {
          status: "error",
          message: "Internal server error",
        };
      }
    },
    {
      params: t.Object({
        placeId: t.String(),
      }),

      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
    }
  );
