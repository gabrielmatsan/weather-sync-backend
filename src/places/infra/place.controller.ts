import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { repositories } from "@/shared/singleton/repositories";
import Elysia, { t } from "elysia";
import { placeType } from "../domain/place.type";
import { getAllPlacesUseCase } from "../application/get-all-places.usecase";

export const PlaceController = new Elysia({
  prefix: "/places",
  tags: ["Places"],
})
  .use(authMiddleware)
  .get(
    "/",
    async ({ set, validateToken }) => {
      try {
        const user = await validateToken();
        if (!user) {
          throw new Error("Unauthorized");
        }
        const response = await getAllPlacesUseCase(
          repositories.placeRepository
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
        set.status = 500;
        console.error("Error fetching places:", error);

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
          data: t.Array(placeType),
        }),
        500: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Places"],
        description: "Get all places",
        summary: "Get all places",
      },
    }
  );
