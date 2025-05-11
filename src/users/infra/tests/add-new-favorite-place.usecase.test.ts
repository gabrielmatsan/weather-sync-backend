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
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import { UserController } from "../user.controller";

describe("Add New Favorite Place Usecase", () => {
  let app: Elysia;
  let userData: CreateUserParams;
  let user: any;
  let place: any;
  let userId: string;
  let tokenData: string | null;
  let placeId: number;

  beforeAll(async () => {
    //@ts-expect-error
    app = new Elysia()
      .use(authMiddleware)
      .use(AuthController)
      .use(UserController);

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
    // 3. Adicionar local para ser adicionado como favorito
    [place] = await db
      .insert(placesSchema)
      .values({
        name: faker.company.name(),
        latitude: faker.location.latitude().toString(),
        longitude: faker.location.longitude().toString(),
      })
      .returning();

    placeId = place.id;
  });

  afterAll(async () => {
    // 1.Deletar os dados de locais favoritos do banco de dados
    if (userId && placeId) {
      await db
        .delete(favoritePlacesSchema)
        .where(
          and(
            eq(favoritePlacesSchema.userId, userId),
            eq(favoritePlacesSchema.placeId, placeId)
          )
        );
    }
    // 2. Deletar o usuário do banco de dados no final do teste
    if (userData && userId) {
      await db.delete(usersSchema).where(eq(usersSchema.email, userData.email));
    }

    // 3. Deletar o local do banco de dados no final do teste
    if (place && placeId) {
      await db.delete(placesSchema).where(eq(placesSchema.id, placeId));
    }

  });

  it("should add a new favorite place successfully", async () => {
    if (!tokenData) {
      throw new Error("Token data is null");
    }
    const response = await app.handle(
      new Request("http://localhost:8080/users/favorite-place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: tokenData,
        },
        body: JSON.stringify({
          placeId: placeId,
        }),
      })
    );

    const responseBody = await response.json();
    console.log("Response Body: ", responseBody);

    const [searchFavoritePlace] = await db
      .select()
      .from(favoritePlacesSchema)
      .where(
        and(
          eq(favoritePlacesSchema.userId, userId),
          eq(favoritePlacesSchema.placeId, placeId)
        )
      );

    expect(searchFavoritePlace).toBeDefined();
    expect(searchFavoritePlace.userId).toBe(userId);
    expect(response.status).toBe(201);
  });
});
