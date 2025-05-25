import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia, { t } from "elysia";
import { addNewFavoritePlaceUseCase } from "../application/add-new-favorite-place.usecase";
import { removeFavoritePlace } from "../application/remove-favorite-place.usecase";
import { getUserRelationsPlacesUseCase } from "../application/user-relations-places.usecase";

export const FavoritePlaceController = new Elysia({
  prefix: "/favorite-places",
  tags: ["Favorite Places"],
})
  .use(authMiddleware)
  .post(
    "/",
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

      detail: {
        summary: "Add a new favorite place",
        tags: ["Favorite Places"],
        description:
          "Add a new favorite place to the user's list of favorite places",
      },
    }
  )

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

      detail: {
        tags: ["Favorite Places"],
        summary: "Remove a favorite place",
        description:
          "Remove a favorite place from the user's list of favorite places",
      },
    }
  )
  .get(
    "/",
    async ({ set, validateToken }) => {
      try {
        const user = await validateToken();

        if (!user) {
          throw new UnauthorizedError();
        }

        const response = await getUserRelationsPlacesUseCase(
          user.id,
          repositories.favoritePlaceRepository
        );

        set.status = 200;
        return {
          status: "success",
          message: "User relations places retrieved successfully",
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
        set.status = 500;
        console.error("Error retrieving user relations places:", error);
        return {
          status: "error",
          message: "Internal server error",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          message: t.String(),
          data: t.Object({
            userRelationsPlaces: t.Array(
              t.Object({
                id: t.Number(),
                name: t.String(),
                isFavorite: t.Boolean(),
              })
            ),
          }),
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
        tags: ["Favorite Places"],
        summary: "Get user relations places",
        description:
          "Get the user's list of favorite places and their favorite status",
      },
    }
  );
