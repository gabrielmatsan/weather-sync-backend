import { AuthController } from "@/auth/infra/auth.controller";
import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { db } from "@/shared/database/db";
import { authMiddleware } from "@/shared/infra/auth.middleware";
import { hashPassword } from "@/shared/infra/password";
import type { CreateUserParams } from "@/users/domain/users-repository.interface";
import { usersSchema } from "@/users/domain/users.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { FavoritePlaceController } from "../favorite-place.controller";

describe("User Relations Places Usecase", () => {
  let app: Elysia;
  let userData: CreateUserParams;
  let user: any;
  let places: any[] = [];
  let userId: string;
  let tokenData: string | null;
  let favoritePlaceId: number;
  let nonFavoritePlaceIds: number[] = [];

  beforeAll(async () => {
    //@ts-expect-error
    app = new Elysia()
      .use(authMiddleware)
      .use(AuthController)
      .use(FavoritePlaceController);

    // 1. Criar um usuário de teste
    let password: string = faker.internet.password();
    let hashedPassword: string = await hashPassword(password);
    userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
      phoneNumber: faker.phone.number({ style: "international" }),
      notifications: "yes",
    };

    [user] = await db.insert(usersSchema).values(userData).returning();
    userId = user.id;

    // 2. Criar um token de autenticação para o usuário
    const token = await app.handle(
      new Request("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: password,
        }),
      })
    );

    tokenData = token.headers.get("set-cookie");
    console.log("Token: ", tokenData);

    if (!tokenData) {
      throw new Error("Token data is null");
    }

    // 3. Criar três locais de teste
    for (let i = 0; i < 3; i++) {
      const [place] = await db
        .insert(placesSchema)
        .values({
          name: faker.company.name(),
          latitude: faker.location.latitude().toString(),
          longitude: faker.location.longitude().toString(),
        })
        .returning();

      places.push(place);
    }

    // 4. Adicionar apenas o primeiro lugar como favorito
    favoritePlaceId = places[0].id;
    nonFavoritePlaceIds = places.slice(1).map((place) => place.id);

    await db.insert(favoritePlacesSchema).values({
      userId: userId,
      placeId: favoritePlaceId,
    });
  });

  afterAll(async () => {
    // 1. Deletar os dados de locais favoritos do banco de dados
    if (userId) {
      await db
        .delete(favoritePlacesSchema)
        .where(eq(favoritePlacesSchema.userId, userId));
    }

    // 2. Deletar os locais do banco de dados
    for (const place of places) {
      await db.delete(placesSchema).where(eq(placesSchema.id, place.id));
    }

    // 3. Deletar o usuário do banco de dados no final do teste
    if (userData && userId) {
      await db.delete(usersSchema).where(eq(usersSchema.email, userData.email));
    }
  });

  it("should return all places with their favorite status", async () => {
    if (!tokenData) {
      throw new Error("Token data is null");
    }

    const response = await app.handle(
      new Request("http://localhost:8080/favorite-places/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: tokenData,
        },
      })
    );

    // Verifica se a resposta tem status 200
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    console.log("Response Body: ", responseBody);

    // Verifica o formato da resposta
    expect(responseBody.status).toBe("success");
    expect(responseBody.message).toBe(
      "User relations places retrieved successfully"
    );
    expect(responseBody.data).toBeDefined();
    expect(responseBody.data.userRelationsPlaces).toBeDefined();
    expect(Array.isArray(responseBody.data.userRelationsPlaces)).toBe(true);

    // Verifica se todos os lugares estão presentes
    expect(responseBody.data.userRelationsPlaces.length).toBeGreaterThanOrEqual(
      places.length
    );

    // Verifica se o lugar marcado como favorito tem a flag isFavorite como true
    const favoritePlace = responseBody.data.userRelationsPlaces.find(
      (place: any) => place.id === favoritePlaceId
    );
    expect(favoritePlace).toBeDefined();
    expect(favoritePlace.isFavorite).toBe(true);

    // Verifica se os outros lugares têm a flag isFavorite como false
    for (const nonFavoriteId of nonFavoritePlaceIds) {
      const nonFavoritePlace = responseBody.data.userRelationsPlaces.find(
        (place: any) => place.id === nonFavoriteId
      );

      // Só testa se o lugar for encontrado na resposta
      if (nonFavoritePlace) {
        expect(nonFavoritePlace.isFavorite).toBe(false);
      }
    }
  });
});
